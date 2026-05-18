package authorization

import (
	"errors"
	"fmt"
	"net/url"
	"strings"

	"github.com/flowtrove/packages/authorization/utils"
	jwtware "github.com/gofiber/contrib/v3/jwt"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/extractors"
	"github.com/golang-jwt/jwt/v5"
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
//
// Errors are returned as JSON envelopes with a machine-readable `code`
// field so the frontend can distinguish recoverable conditions
// (TOKEN_EXPIRED, AUTH_REQUIRED) from terminal ones (TOKEN_INVALID).
func (a *Authorization) UseAPIAuthorization(opts ...AuthConfigOptions) fiber.Handler {
	cfg := NewAuthConfig(opts...)

	jwtHandler := jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{Key: []byte(a.tokenManager.GetJWTSecret())},
		Extractor:  extractors.FromAuthHeader("Bearer"),
		ErrorHandler: func(c fiber.Ctx, err error) error {
			return jwtErrorResponse(c, err)
		},
		SuccessHandler: func(c fiber.Ctx) error {
			if len(cfg.roles) == 0 {
				return c.Next()
			}
			roles, err := a.GetRoles(c)
			if err != nil {
				return jsonError(c, fiber.StatusInternalServerError, err, SERVER_ERROR)
			}
			if hasRole, _, _ := a.GetRole(cfg.roles, roles); !hasRole {
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

// jwtErrorResponse maps the various error conditions surfaced by the
// JWT middleware to a stable JSON envelope. The frontend keys on the
// `code` field to decide whether to refresh-and-retry or sign the user
// out, so the upstream string body would force the client to guess -
// and historically led to spurious sign-outs.
func jwtErrorResponse(c fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, extractors.ErrNotFound),
		errors.Is(err, jwtware.ErrMissingToken):
		return jsonErrorMsgCode(c, fiber.StatusUnauthorized, "authentication required", AUTH_REQUIRED)
	case errors.Is(err, jwt.ErrTokenExpired):
		return jsonErrorMsgCode(c, fiber.StatusUnauthorized, "access token expired", TOKEN_EXPIRED)
	case errors.Is(err, jwt.ErrTokenNotValidYet):
		return jsonErrorMsgCode(c, fiber.StatusUnauthorized, "token not yet valid", TOKEN_INVALID)
	case errors.Is(err, jwt.ErrTokenMalformed),
		errors.Is(err, jwt.ErrTokenSignatureInvalid),
		errors.Is(err, jwt.ErrTokenUnverifiable),
		errors.Is(err, jwt.ErrTokenInvalidClaims),
		errors.Is(err, jwt.ErrSignatureInvalid):
		return jsonErrorMsgCode(c, fiber.StatusUnauthorized, "invalid access token", TOKEN_INVALID)
	}
	if fe, ok := err.(*fiber.Error); ok {
		return jsonErrorMsgCode(c, fe.Code, fe.Message, TOKEN_INVALID)
	}
	return jsonErrorMsgCode(c, fiber.StatusUnauthorized, err.Error(), TOKEN_INVALID)
}

// jsonErrorMsgCode mirrors jsonError but accepts a literal message and
// also surfaces the structured `{error, message, code}` envelope used
// across the rest of the application. The legacy `error` string is
// preserved so older clients keep working.
func jsonErrorMsgCode(c fiber.Ctx, status int, msg, code string) error {
	return c.Status(status).JSON(fiber.Map{
		"error":   msg,
		"message": msg,
		"code":    code,
	})
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
			if hasRole, _, _ := a.GetRole(cfg.roles, userRoles); !hasRole {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"error": fmt.Sprintf("insufficient permissions: %s", strings.Join(cfg.roles, ", ")),
					"code":  INSUFFICIENT_PERMISSIONS,
				})
			}
		}
		return c.Next()
	}
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
