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
	userRoles := app.freshUserRoles(reqCtx, user.UserID, user.Roles)

	service, err := gorm.G[models.Service](app.postgres).
		Select("id, name, title, icon, description, roles").
		Where("name = ?", serviceName).
		First(reqCtx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			if !app.userCanAccessService(nil, serviceName, userRoles) {
				return nil, ErrServiceAccessDenied
			}
			services, err := app.getServicesData(reqCtx, userRoles)
			if err != nil {
				return nil, err
			}
			return map[string]any{
				"current_service": serviceName,
				"services":        services,
				"service": map[string]any{
					"name":  serviceName,
					"title": serviceName,
				},
				"current_user_id": user.UserID,
				"navigations":     []map[string]any{},
			}, nil
		}
		return nil, err
	}

	if !app.userCanAccessService(service.Roles, service.Name, userRoles) {
		return nil, ErrServiceAccessDenied
	}

	services, err := app.getServicesData(reqCtx, userRoles)
	if err != nil {
		return nil, err
	}

	navigations, err := app.getNavigationData(reqCtx, service.ID, userRoles)
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
