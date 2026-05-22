package dashboard

import (
	"context"

	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
)

type Controller struct {
	app *config.AppClients
}

func NewController(app *config.AppClients) *Controller {
	return &Controller{
		app: app,
	}
}

func SetupApiRoutes(api fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	api.Get("/dashboard", controller.GetDashboardDataApi)
}

func SetupWebRoutes(app fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	app.Get("/dashboard", controller.GetDashboardDataView)
}

func (c *Controller) GetDashboardDataView(ctx fiber.Ctx) error {
	reqCtx := ctx.Context()
	data, err := c.getDashboardData(reqCtx)
	if err != nil {
		return c.app.View(ctx, c.app.Render().WithError(err), c.app.Render().WithStatus(fiber.StatusInternalServerError), c.app.Render().WithCode("INTERNAL_SERVER_ERROR"))
	}
	return c.app.View(ctx, c.app.Render().WithTitle("Dashboard"), c.app.Render().WithData(data))
}

func (c *Controller) GetDashboardDataApi(ctx fiber.Ctx) error {
	reqCtx := ctx.Context()
	data, err := c.getDashboardData(reqCtx)
	if err != nil {
		return c.app.Api(ctx, c.app.Render().WithError(err), c.app.Render().WithStatus(fiber.StatusInternalServerError), c.app.Render().WithCode("INTERNAL_SERVER_ERROR"))
	}
	return c.app.Api(ctx, c.app.Render().WithTitle("Dashboard"), c.app.Render().WithData(data))
}

func (c *Controller) getDashboardData(ctx context.Context) (map[string]any, error) {
	data := map[string]any{
		"ok": true,
		"analytics": map[string]any{
			"messages":      0, // TODO: Query from messages table
			"notifications": 0, // TODO: Query from notifications table
			"tasks":         0, // TODO: Query from tasks table
			"appointments":  0, // TODO: Query from appointments table
		},
		"apps":       []map[string]any{},
		"activities": []map[string]any{},
	}
	return data, nil
}
