package orgunits

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
	"github.com/uetedu/app/internal/cadmin/orgunits/list"
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
	api := apiGroup.Group("/orgunits")
	list.SetupApiRoutes(api, appClients)

	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(appGroup fiber.Router, appClients *config.AppClients) {
	app := appGroup.Group("/orgunits")
	list.SetupWebRoutes(app, appClients)
	// app.Get("/", appClients.WebView("OrgUnits")) // Web endpoint for getting enter data

	app.Use(appClients.ViewNotFound)
}
