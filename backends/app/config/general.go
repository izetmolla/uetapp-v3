package config

import (
	"context"
	"errors"

	"github.com/flowtrove/packages/models"
	"github.com/flowtrove/packages/render"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (app *AppClients) withGeneralData() render.GeneralDataFunc {
	return func(c fiber.Ctx, reqCtx context.Context, serviceName string, forApi bool) (map[string]any, error) {
		return app.GeneralData(c, reqCtx, serviceName, forApi)
	}
}

func (app *AppClients) GeneralData(c fiber.Ctx, reqCtx context.Context, serviceName string, forApi bool) (map[string]any, error) {
	user, err := app.USER(c, reqCtx, forApi)
	if err != nil {
		return nil, err
	}

	service, err := gorm.G[models.Service](app.postgres).
		Select("id, name, title, icon, description").
		Where("name = ?", serviceName).
		First(reqCtx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			service, err = gorm.G[models.Service](app.postgres).
				Where("name = ?", app.appService).
				First(reqCtx)
			if err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}

	services, err := app.getServicesData(reqCtx, removeRolePrefix(user.Roles))
	if err != nil {
		return nil, err
	}

	navigations, err := app.getNavigationData(reqCtx, service.ID, removeRolePrefix(user.Roles))
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"current_service": serviceName,
		"services":        services,
		"service":         service,
		"current_user_id": user.UserID,
		"navigations":     formatNavigation(navigations),
	}, nil
}
