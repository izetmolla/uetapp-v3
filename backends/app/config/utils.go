package config

import (
	"context"

	"github.com/gofiber/fiber/v3"
)

func (app *AppClients) getWsData(reqCtx context.Context, wsID string) (map[string]any, error) {

	return map[string]any{}, nil
}

func (app *AppClients) getCurrentUserID(c fiber.Ctx, fromAPI ...bool) (string, error) {
	if len(fromAPI) > 0 && fromAPI[0] {
		authData, err := app.Auth().GetAuthDataAPI(c)
		if err != nil {
			return "", err
		}
		return authData.UserID, nil
	}
	authData, err := app.Auth().GetAuthDataWEB(c)
	if err != nil {
		return "", err
	}
	return authData.UserID, nil
}
