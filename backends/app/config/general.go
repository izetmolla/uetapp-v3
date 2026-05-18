package config

import (
	"context"
	"errors"

	"github.com/flowtrove/packages/models"
	"github.com/flowtrove/packages/render"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

// ErrServiceAccessDenied is returned when the user cannot access the requested service.
var ErrServiceAccessDenied = errors.New("insufficient permissions for this service")

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
		Select("id, name, title, icon, description, roles").
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

	if !app.userCanAccessService(service.Roles, user.Roles) {
		return nil, ErrServiceAccessDenied
	}

	services, err := app.getServicesData(reqCtx, user.Roles)
	if err != nil {
		return nil, err
	}

	navigations, err := app.getNavigationData(reqCtx, service.ID, user.Roles)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"current_service": serviceName,
		"services":        services,
		"service": map[string]any{
			"id":          service.ID,
			"name":        service.Name,
			"title":       service.Title,
			"icon":        service.Icon,
			"description": service.Description,
			"roles":       service.Roles,
		},
		"current_user_id": user.UserID,
		"navigations":     formatNavigation(navigations),
	}, nil
}
