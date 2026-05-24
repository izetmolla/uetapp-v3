package device

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
)

type Controller struct {
	app *config.AppClients
}

func NewController(app *config.AppClients) *Controller {
	return &Controller{app: app}
}

func SetupApiRoutes(apiGroup fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	api := apiGroup.Group("/device")
	api.Get("/folders-to-scan", controller.GetFoldersToScanByDevice)
}
