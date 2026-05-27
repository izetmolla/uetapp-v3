package secretary

import (
	"errors"

	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
	"github.com/uetedu/app/modules/secretary/suplements"
)

type Controller struct {
	app *config.AppClients
}

func NewController(app *config.AppClients) *Controller {
	return &Controller{
		app: app,
	}
}

func SetupApiRoutes(apiGroup fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	api := apiGroup.Group("/secretary", controller.SecretaryMiddlewareApi)
	suplements.SetupApiRoutes(api, appClients)

	// app.Get("/", controller.GetEnterDataView) // Web endpoint for getting enter data

	// api.Get("/enter", controller.GetEnterDataApi) // API endpoint for getting enter data
	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(appGroup fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	app := appGroup.Group("/secretary", controller.SecretaryMiddlewareView)
	suplements.SetupWebRoutes(app, appClients)
	app.Get("/", appClients.WebView("Secretary")) // Web endpoint for getting enter data

	app.Use(appClients.ViewNotFound)
}

func (cc *Controller) secretaryMiddleware(ctx fiber.Ctx, fromAPI bool) error {
	render := cc.app.Render()
	reqCtx := ctx.Context()
	user, err := cc.app.USER(ctx, reqCtx, fromAPI)
	if err != nil {
		if fromAPI {
			return cc.app.Api(ctx, render.WithError(err), render.WithStatus(fiber.StatusUnauthorized), render.WithCode("UNAUTHORIZED"))
		}
		return cc.app.View(ctx, render.WithError(err), render.WithStatus(fiber.StatusUnauthorized), render.WithCode("UNAUTHORIZED"))
	}
	hasRole, _, _ := cc.app.GetRole([]string{"admin", "secretary"}, user.Roles)
	if !hasRole {
		err := errors.New("insufficient permissions")
		if fromAPI {
			return cc.app.Api(ctx, render.WithError(err), render.WithStatus(fiber.StatusForbidden), render.WithCode("INSUFFICIENT_PERMISSIONS"))
		}
		return cc.app.View(ctx, render.WithError(err), render.WithStatus(fiber.StatusForbidden), render.WithCode("INSUFFICIENT_PERMISSIONS"))
	}
	ctx.Locals("user", user)
	return ctx.Next()
}

func (cc *Controller) SecretaryMiddlewareApi(ctx fiber.Ctx) error {
	return cc.secretaryMiddleware(ctx, true)
}

func (cc *Controller) SecretaryMiddlewareView(ctx fiber.Ctx) error {
	return cc.secretaryMiddleware(ctx, false)
}
