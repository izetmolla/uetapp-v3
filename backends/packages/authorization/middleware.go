package authorization

import (
	"errors"
	"fmt"
	"net/url"
	"slices"
	"strings"

	"github.com/flowtrove/packages/authorization/utils"
	jwtware "github.com/gofiber/contrib/v3/jwt"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/extractors"
	"gorm.io/gorm"
)

// AuthConfig controls the per-route behaviour of the API/WEB middlewares.
//
// Build it with NewAuthConfig + WithXxx options. The zero value is a
// valid no-op config: no excluded paths, no role gate.
type AuthConfig struct {
	excludedPaths    []string
	roles            []string
	reauthorize      bool
	redirectToSignIn bool
	debug            bool
}

// AuthConfigOptions mutates an AuthConfig in place.
type AuthConfigOptions func(*AuthConfig)

func defaultAuthConfig() *AuthConfig {
	return &AuthConfig{
		excludedPaths: []string{},
		roles:         []string{},
	}
}

// NewAuthConfig applies the provided options on top of the defaults.
func NewAuthConfig(opts ...AuthConfigOptions) *AuthConfig {
	cfg := defaultAuthConfig()
	for _, opt := range opts {
		if opt != nil {
			opt(cfg)
		}
	}
	return cfg
}

// --- Option setters ------------------------------------------------------
//
// They are defined on *Authorization so callers can write
//   auth.UseAPIAuthorization(auth.WithRoles(...))
// instead of importing them separately.

// WithExcludedPaths whitelists path prefixes that should not require auth.
func (a *Authorization) WithExcludedPaths(paths []string) AuthConfigOptions {
	return func(c *AuthConfig) { c.excludedPaths = paths }
}

// WithRoles enforces that the caller carries at least one of the named roles.
func (a *Authorization) WithRoles(roles []string) AuthConfigOptions {
	return func(c *AuthConfig) { c.roles = roles }
}

// WithReauthorize toggles forced re-authorization on the next request.
func (a *Authorization) WithReauthorize(reauthorize bool) AuthConfigOptions {
	return func(c *AuthConfig) { c.reauthorize = reauthorize }
}

// WithRedirectToSignIn enables redirecting unauthenticated WEB requests
// to the configured sign-in URL.
func (a *Authorization) WithRedirectToSignIn(redirectToSignIn bool) AuthConfigOptions {
	return func(c *AuthConfig) { c.redirectToSignIn = redirectToSignIn }
}

// WithDebug enables verbose middleware logging.
func (a *Authorization) WithDebug(debug bool) AuthConfigOptions {
	return func(c *AuthConfig) { c.debug = debug }
}

// --- Middlewares ----------------------------------------------------------

// UseAPIAuthorization returns a Fiber middleware that protects API
// routes with a Bearer-token JWT. When AuthConfig.roles is non-empty,
// the JWT must carry at least one matching role; otherwise the request
// is rejected with 403 INSUFFICIENT_PERMISSIONS.
//
// Excluded paths declared on the config are honored: they short-circuit
// the JWT check entirely.
func (a *Authorization) UseAPIAuthorization(opts ...AuthConfigOptions) fiber.Handler {
	cfg := NewAuthConfig(opts...)

	jwtHandler := jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{Key: []byte(a.tokenManager.GetJWTSecret())},
		Extractor:  extractors.FromAuthHeader("Bearer"),
		SuccessHandler: func(c fiber.Ctx) error {
			if len(cfg.roles) == 0 {
				return c.Next()
			}
			roles, err := a.GetRoles(c)
			if err != nil {
				return jsonError(c, fiber.StatusInternalServerError, err, SERVER_ERROR)
			}
			if !hasAnyRole(cfg.roles, roles) {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"error": fmt.Sprintf("insufficient permissions: %s", strings.Join(cfg.roles, ", ")),
					"code":  INSUFFICIENT_PERMISSIONS,
				})
			}
			return c.Next()
		},
	})

	if len(cfg.excludedPaths) == 0 {
		return jwtHandler
	}
	return func(c fiber.Ctx) error {
		if utils.IsExcludedPath(cfg.excludedPaths, c.Path()) {
			return c.Next()
		}
		return jwtHandler(c)
	}
}

// UseWEBAuthorization returns a Fiber middleware that protects WEB
// routes with a session cookie. Missing or invalid cookies are
// redirected to the sign-in URL (preserving the original request URL
// in `redirectUrl`).
func (a *Authorization) UseWEBAuthorization(opts ...AuthConfigOptions) fiber.Handler {
	cfg := NewAuthConfig(opts...)
	return func(c fiber.Ctx) error {
		if utils.IsExcludedPath(cfg.excludedPaths, c.Path()) {
			return c.Next()
		}

		sessionID := c.Cookies(a.cookieSessionName)
		if sessionID == "" {
			return c.Redirect().Status(fiber.StatusTemporaryRedirect).To(a.getAuthRedirectURL(c))
		}

		session, err := a.GetSession(c.Context(), sessionID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return c.Redirect().Status(fiber.StatusTemporaryRedirect).To(a.getAuthRedirectURL(c))
			}
			return jsonError(c, fiber.StatusInternalServerError, err, SERVER_ERROR)
		}

		if len(cfg.roles) > 0 {
			userRoles := utils.FormatRoles(session.User.Roles)
			if !hasAnyRole(cfg.roles, userRoles) {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"error": fmt.Sprintf("insufficient permissions: %s", strings.Join(cfg.roles, ", ")),
					"code":  INSUFFICIENT_PERMISSIONS,
				})
			}
		}
		return c.Next()
	}
}

// hasAnyRole reports whether `userRoles` contains at least one of the
// `required` roles.
func hasAnyRole(required, userRoles []string) bool {
	if len(required) == 0 {
		return true
	}
	if len(userRoles) == 0 {
		return false
	}
	for _, r := range required {
		if slices.Contains(userRoles, r) {
			return true
		}
	}
	return false
}

// getAuthRedirectURL builds the sign-in URL with a `redirectUrl` query
// parameter pointing back at the original request, preserving the
// browser scheme.
func (a *Authorization) getAuthRedirectURL(c fiber.Ctx) string {
	scheme := "http"
	if c.Protocol() == "https" || c.Secure() {
		scheme = "https"
	}
	original := fmt.Sprintf("%s://%s%s", scheme, c.Hostname(), c.OriginalURL())
	return fmt.Sprintf("%s?redirectUrl=%s", a.signInRedirectURL, url.QueryEscape(original))
}

// GetSessionID returns the session id carried by the request's session
// cookie, or "" when absent.
func (a *Authorization) GetSessionID(c fiber.Ctx) string {
	return c.Cookies(a.cookieSessionName)
}
