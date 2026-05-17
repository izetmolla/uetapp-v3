package students

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

func SetupApiRoutes(apiGroup fiber.Router, appClients *config.AppClients) {
	api := apiGroup.Group("/students")
	controller := NewController(appClients)
	api.Get("/", controller.GetStudentsListApi)
	// app.Get("/", controller.GetEnterDataView) // Web endpoint for getting enter data

	// api.Get("/enter", controller.GetEnterDataApi) // API endpoint for getting enter data
	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(appGroup fiber.Router, appClients *config.AppClients) {
	app := appGroup.Group("/students")

	// app.Get("/", controller.GetEnterDataView) // Web endpoint for getting enter data

	// api.Get("/enter", controller.GetEnterDataApi) // API endpoint for getting enter data
	app.Use(appClients.ViewNotFound)
}
