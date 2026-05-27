package admin

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
	api.Post("/admin/updatefrontend", controller.UpdateFrontend)
	api.Get("/admin/updatefrontend", controller.UpdateFrontend)
	api.Get("/admin/getversion", controller.GetCurrentVersion)
	api.Post("/admin/getversion", controller.GetCurrentVersion)
}
