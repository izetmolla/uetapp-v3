package enter

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

func SetupRoutes(app fiber.Router, api fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)

	app.Get("/", controller.GetEnterDataView) // Web endpoint for getting enter data

	api.Get("/enter", controller.GetEnterDataApi) // API endpoint for getting enter data
}
