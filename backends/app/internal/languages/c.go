package languages

import (
	"github.com/flowtrove/app/config"
	"github.com/gofiber/fiber/v3"
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
	api.Get("/languages/:lng/:ns.json", controller.GetLanguages)
}

func (c *Controller) GetLanguages(ctx fiber.Ctx) error {
	return c.app.Api(ctx, c.app.Render().WithData(fiber.Map{}))
}
