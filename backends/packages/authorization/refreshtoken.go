package authorization

import (
	"errors"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm/logger"
)

func (a *Authorization) HandleRefreshToken(c fiber.Ctx) error {
	ctx := c.Context()
	tm := a.TokenManager()
	// Check if this request is meant for refresh token handling
	if c.Get(RefreshTokenHandlerIdentifier, "no") == "no" {
		return c.Next()
	}

	refreshToken, err := tm.GetTokenFromHeader(c.Get("Authorization"))
	if err != nil {
		// Try to get from request body
		type RefreshRequest struct {
			RefreshToken string `json:"refresh_token"`
		}
		var req RefreshRequest
		if err := c.Bind().Body(&req); err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": err.Error(),
				"code":  TOKEN_INVALID,
			})
		}
		refreshToken = req.RefreshToken
	}

	if refreshToken == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "refresh token is required",
			"code":  TOKEN_INVALID,
		})

	}
	refreshTokenClaims, err := tm.ExtractToken(refreshToken)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": err.Error(),
			"code":  TOKEN_INVALID,
		})
	}

	sessionData, err := a.GetSession(ctx, refreshTokenClaims.SessionID)
	if err != nil {
		if errors.Is(err, logger.ErrRecordNotFound) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "session not found",
				"code":  UNAUTHORIZED,
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
			"code":  SERVER_ERROR,
		})
	}
	accessToken, err := tm.RefreshAccessToken(refreshTokenClaims, sessionData)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
			"code":  SERVER_ERROR,
		})
	}

	return c.Status(fiber.StatusOK).JSON(accessToken)
}
