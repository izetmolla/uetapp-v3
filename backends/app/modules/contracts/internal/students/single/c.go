package single

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
	api := apiGroup.Group("/single")
	api.Get("/", controller.GetStudentDetailAPI)
	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(appGroup fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	app := appGroup.Group("/single")
	app.Get("/", controller.GetStudentDetailView)
	app.Use(appClients.ViewNotFound)
}
