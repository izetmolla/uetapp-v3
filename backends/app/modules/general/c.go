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
