package users

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
	"github.com/uetedu/app/internal/cadmin/users/enroll"
	"github.com/uetedu/app/internal/cadmin/users/list"
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
	api := apiGroup.Group("/users")
	list.SetupApiRoutes(api, appClients)
	enroll.SetupApiRoutes(api, appClients)

	// app.Get("/", controller.GetEnterDataView) // Web endpoint for getting enter data

	// api.Get("/enter", controller.GetEnterDataApi) // API endpoint for getting enter data
	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(appGroup fiber.Router, appClients *config.AppClients) {
	app := appGroup.Group("/users")
	list.SetupWebRoutes(app, appClients)
	enroll.SetupWebRoutes(app, appClients)
	app.Get("/", appClients.WebView("Users")) // Web endpoint for getting enter data

	// api.Get("/enter", controller.GetEnterDataApi) // API endpoint for getting enter data
	app.Use(appClients.ViewNotFound)
}
