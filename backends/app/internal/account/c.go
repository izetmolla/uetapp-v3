package account

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
	"github.com/uetedu/app/internal/account/profile"
	"github.com/uetedu/app/internal/account/sessions"
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
	api := apiGroup.Group("/account", controller.AccountMiddlewareApi)
	profile.SetupApiRoutes(api, appClients)
	sessions.SetupApiRoutes(api, appClients)
	// app.Get("/", controller.GetEnterDataView) // Web endpoint for getting enter data

	// api.Get("/enter", controller.GetEnterDataApi) // API endpoint for getting enter data
	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(appGroup fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	app := appGroup.Group("/account", controller.AccountMiddlewareView)
	profile.SetupWebRoutes(app, appClients)
	sessions.SetupWebRoutes(app, appClients)
	app.Get("/", appClients.WebView("Account")) // Web endpoint for getting enter data

	app.Use(appClients.ViewNotFound)
}

func (c *Controller) AccountMiddlewareApi(ctx fiber.Ctx) error {
	// wsName := strings.TrimSpace(ctx.Params("ws", ctx.Query("ws")))
	// if ctx.Method() == "POST" || ctx.Method() == "PUT" || ctx.Method() == "PATCH" || ctx.Method() == "DELETE" {
	// 	if bodyWsName, ok := getWsNameFromPostMethodBody(ctx.Body()); ok {
	// 		wsName = bodyWsName
	// 	}
	// }
	// if wsName == "" {
	// 	return ctx.Next()
	// }
	// context := ctx.Context()
	// ws, err := c.app.GetWSAPI(ctx,
	// 	c.app.WithWsSelectFields("id, id_number, name"),
	// 	c.app.WithWsContext(context),
	// 	c.app.WithWsName(wsName))
	// if err != nil {
	// 	return c.app.ApiError(ctx, err)
	// }
	// ctx.Locals("ws", ws)
	return ctx.Next()
}

func (c *Controller) AccountMiddlewareView(ctx fiber.Ctx) error {
	// // Keep in sync with [config.reservedWorkspacePathSegment]: /api must not be treated as a tenant slug.
	// if ctx.Params("ws") == "api" {
	// 	return ctx.Next()
	// }
	// context := ctx.Context()
	// view := c.app.View()

	// ws, err := c.app.GetWS(ctx, c.app.WithWsSelectFields("id, id_number, name"), c.app.WithWsContext(context), c.app.WithWsName(ctx.Params("ws")))
	// if err != nil {
	// 	return c.app.RenderView(ctx,
	// 		view.WithContext(context),
	// 		view.WithViewTitle("Workspace not found"),
	// 		view.WithViewError(err,
	// 			view.WithViewErrorTitle("Error"),
	// 			view.WithViewErrorStatus("Workspace not found"),
	// 			view.WithViewErrorErrorCode(fiber.StatusNotFound),
	// 		))
	// }
	// ctx.Locals("ws", ws)
	return ctx.Next()
}
