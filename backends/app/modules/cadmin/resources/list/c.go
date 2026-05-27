package list

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
	api := apiGroup.Group("/list")
	controller := NewController(appClients)
	api.Get("/", controller.GetResourcesListAPI)
	api.Get("/columns", controller.GetResourcesColumns)
	api.Post("/", controller.CreateResource)
	api.Put("/:id", controller.UpdateResource)
	api.Delete("/", controller.DeleteResources)
	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(app fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	app.Get("/", controller.GetResourcesListView)
}
