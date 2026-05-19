package config

import (
	"context"
	"errors"
	"fmt"

	"github.com/flowtrove/packages/render"
	"github.com/gofiber/fiber/v3"
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

	service, err := app.getServiceData(reqCtx, serviceName)
	if err != nil {
		return nil, err
	}
	fmt.Println("service.Roles", service.Roles)
	if len(service.Roles) > 0 && !app.userCanAccessService(service.Roles, service.Name, userRoles) {
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
