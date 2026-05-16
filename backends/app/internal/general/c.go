package general

import (
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

func SetupRoutes(api fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	api.Get("/general", controller.GetGeneralDataApi)
}

func (c *Controller) GetGeneralDataApi(ctx fiber.Ctx) error {
	render := c.app.Render()
	context := ctx.Context()
	return c.app.Api(ctx, render.WithContext(context), render.WithData(fiber.Map{
		"ws":              nil,
		"current_user_id": "",
		"navigations":     []any{},
	}))
}
