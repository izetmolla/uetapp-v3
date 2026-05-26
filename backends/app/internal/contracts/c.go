package contracts

import (
	"errors"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
	"github.com/uetedu/app/internal/contracts/scandocuments"
	"github.com/uetedu/app/internal/contracts/students"
	"github.com/uetedu/app/internal/contracts/syncstudent"
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
	api := apiGroup.Group("/contracts", controller.ContractsMiddlewareApi)
	syncstudent.SetupApiRoutes(api, appClients)
	scandocuments.SetupApiRoutes(api, appClients)
	students.SetupApiRoutes(api, appClients)
	// suplements.SetupApiRoutes(api, appClients)

	// app.Get("/", controller.GetEnterDataView) // Web endpoint for getting enter data

	// api.Get("/enter", controller.GetEnterDataApi) // API endpoint for getting enter data
	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(appGroup fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	app := appGroup.Group("/contracts", controller.ContractsMiddlewareView)
	scandocuments.SetupWebRoutes(app, appClients)
	students.SetupWebRoutes(app, appClients)
	// suplements.SetupWebRoutes(app, appClients)
	app.Get("/", appClients.WebView("Contracts"))

	app.Use(appClients.ViewNotFound)
}

func (cc *Controller) contractsMiddleware(ctx fiber.Ctx, fromAPI bool) error {
	render := cc.app.Render()
	reqCtx := ctx.Context()
	user, err := cc.app.USER(ctx, reqCtx, fromAPI)
	if err != nil {
		if fromAPI {
			return cc.app.Api(ctx, render.WithError(err), render.WithStatus(fiber.StatusUnauthorized), render.WithCode("UNAUTHORIZED"))
		}
		return cc.app.View(ctx, render.WithError(err), render.WithStatus(fiber.StatusUnauthorized), render.WithCode("UNAUTHORIZED"))
	}
	hasRole, _, _ := cc.app.GetRole([]string{"admin", "contracts"}, user.Roles)
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

func (cc *Controller) ContractsMiddlewareApi(ctx fiber.Ctx) error {
	return cc.contractsMiddleware(ctx, true)
}

func (cc *Controller) ContractsMiddlewareView(ctx fiber.Ctx) error {
	if strings.HasPrefix(ctx.Path(), "/contracts/scandocuments/folders/device") {
		return ctx.Next()
	}
	return cc.contractsMiddleware(ctx, false)
}
