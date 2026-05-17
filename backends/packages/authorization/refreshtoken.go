package authorization

import (
	"errors"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

// HandleRefreshToken is a middleware that conditionally services
// refresh-token requests. The request is only handled when the client
// opts in by setting the RefreshTokenHandlerIdentifier header; every
// other request is forwarded to the next handler.
//
// On success the response body is the new access token; on failure a
// JSON envelope with an error message and machine-readable code is
// returned.
func (a *Authorization) HandleRefreshToken(c fiber.Ctx) error {
	if c.Get(RefreshTokenHandlerIdentifier, "no") == "no" {
		return c.Next()
	}

	tm := a.tokenManager
	ctx := c.Context()

	refreshToken, err := tm.GetTokenFromHeader(c.Get("Authorization"))
	if err != nil {
		refreshToken = bodyRefreshToken(c)
	}
	if refreshToken == "" {
		return jsonError(c, fiber.StatusUnauthorized, ErrMissingRefreshToken, TOKEN_INVALID)
	}

	claims, err := tm.ExtractToken(refreshToken)
	if err != nil {
		return jsonError(c, fiber.StatusUnauthorized, err, TOKEN_INVALID)
	}

	session, err := a.GetSession(ctx, claims.SessionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return jsonError(c, fiber.StatusUnauthorized, ErrSessionNotFound, UNAUTHORIZED)
		}
		return jsonError(c, fiber.StatusInternalServerError, err, SERVER_ERROR)
	}

	accessToken, err := tm.RefreshAccessToken(claims, session)
	if err != nil {
		return jsonError(c, fiber.StatusInternalServerError, err, SERVER_ERROR)
	}

	return c.Status(fiber.StatusOK).JSON(accessToken)
}

// bodyRefreshToken pulls a refresh token out of the JSON body. Errors
// are swallowed: an absent body simply means "no fallback available".
func bodyRefreshToken(c fiber.Ctx) string {
	var body struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := c.Bind().Body(&body); err != nil {
		return ""
	}
	return body.RefreshToken
}

// jsonError is a tiny helper that DRYs up the package's
// {error, code} JSON error envelope.
func jsonError(c fiber.Ctx, status int, err error, code string) error {
	return c.Status(status).JSON(fiber.Map{
		"error": err.Error(),
		"code":  code,
	})
}
