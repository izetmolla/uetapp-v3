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
	"gorm.io/gorm/logger"
)

type AuthConfigOptions func(*AuthConfig)
type AuthConfig struct {
	excludedPaths    []string
	roles            []string
	reauthorize      bool
	redirectToSignIn bool
	debug            bool
}

func defaultAuthConfig() *AuthConfig {
	return &AuthConfig{
		excludedPaths:    []string{},
		roles:            []string{},
		reauthorize:      false,
		redirectToSignIn: false,
		debug:            false,
	}
}

func NewAuthConfig(opts ...AuthConfigOptions) *AuthConfig {
	config := defaultAuthConfig()
	for _, opt := range opts {
		opt(config)
	}
	return config
}

func (a *Authorization) UseAPIAuthorization(opts ...AuthConfigOptions) fiber.Handler {
	config := NewAuthConfig(opts...)
	return jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{Key: []byte(a.tokenManager.GetJWTSecret())},
		Extractor:  extractors.FromAuthHeader("Bearer"),
		SuccessHandler: func(c fiber.Ctx) error {
			roles, err := a.GetRoles(c)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": err.Error(),
					"code":  SERVER_ERROR,
				})
			}
			if len(config.roles) > 0 {
				if !slices.ContainsFunc(config.roles, func(required string) bool {
					return slices.Contains(roles, required)
				}) {
					return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
						"error": fmt.Sprintf("insufficient permissions: %s", strings.Join(config.roles, ", ")),
						"code":  INSUFFICIENT_PERMISSIONS,
					})
				}
			}
			return c.Next()
		},
	})
}

func (a *Authorization) UseWEBAuthorization(opts ...AuthConfigOptions) fiber.Handler {
	config := NewAuthConfig(opts...)
	return func(c fiber.Ctx) error {
		ctx := c.Context()
		if utils.IsExcludedPath(config.excludedPaths, c.Path()) {
			return c.Next()
		}

		sessionID := c.Cookies(a.cookieSessionName)
		if sessionID == "" {
			return c.Redirect().Status(fiber.StatusTemporaryRedirect).To(a.getAuthRedirectURL(c))
		}
		session, err := a.GetSession(ctx, sessionID)
		if err != nil {
			if errors.Is(err, logger.ErrRecordNotFound) {
				return c.Redirect().Status(fiber.StatusTemporaryRedirect).To(a.getAuthRedirectURL(c))
			}
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": err.Error(),
				"code":  SERVER_ERROR,
			})
		}

		if len(config.roles) > 0 {
			if !slices.ContainsFunc(config.roles, func(required string) bool {
				return slices.Contains(utils.FormatRoles(session.User.Roles), required)
			}) {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"error": fmt.Sprintf("insufficient permissions: %s", strings.Join(config.roles, ", ")),
					"code":  INSUFFICIENT_PERMISSIONS,
				})
			}
		}
		return c.Next()
	}
}

// WithExcludedPaths sets the excluded paths for the authentication middleware.
// Example: auth.UseAPIAuthorization(auth.WithExcludedPaths([]string{"/api/public"})))
func (a *Authorization) WithExcludedPaths(paths []string) AuthConfigOptions {
	return func(config *AuthConfig) {
		config.excludedPaths = paths
	}
}

// WithRoles sets the roles for the authentication middleware.
// Example: auth.UseAPIAuthorization(auth.WithRoles([]string{"admin:rw"})))
func (a *Authorization) WithRoles(roles []string) AuthConfigOptions {
	return func(config *AuthConfig) {
		config.roles = roles
	}
}

// WithReauthorize sets the reauthorize flag for the authentication middleware.
// Example: auth.UseAPIAuthorization(auth.WithReauthorize(true)))
func (a *Authorization) WithReauthorize(reauthorize bool) AuthConfigOptions {
	return func(config *AuthConfig) {
		config.reauthorize = reauthorize
	}
}

// WithRedirectToSignIn sets the redirect to sign in flag for the authentication middleware.
// Example: auth.UseAPIAuthorization(auth.WithRedirectToSignIn(true)))
func (a *Authorization) WithRedirectToSignIn(redirectToSignIn bool) AuthConfigOptions {
	return func(config *AuthConfig) {
		config.redirectToSignIn = redirectToSignIn
	}
}

// WithDebug sets the debug flag for the authentication middleware.
// Example: auth.UseAPIAuthorization(auth.WithDebug(true)))
func (a *Authorization) WithDebug(debug bool) AuthConfigOptions {
	return func(config *AuthConfig) {
		config.debug = debug
	}
}

func (a *Authorization) getAuthRedirectURL(c fiber.Ctx) string {
	scheme := "http"
	if c.Protocol() == "https" || c.Secure() {
		scheme = "https"
	}
	return fmt.Sprintf("%s?redirectUrl=%s", a.signInRedirectURL, url.QueryEscape(fmt.Sprintf("%s://%s%s", scheme, c.Hostname(), c.OriginalURL())))
}

func (a *Authorization) GetSessionID(c fiber.Ctx) string {
	return c.Cookies(a.cookieSessionName)
}
