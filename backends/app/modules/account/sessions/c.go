package sessions

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
	"github.com/uetedu/app/modules/account/sessions/list"
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
	api := apiGroup.Group("/sessions")
	list.SetupApiRoutes(api, appClients)
	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(appGroup fiber.Router, appClients *config.AppClients) {
	app := appGroup.Group("/sessions")
	list.SetupWebRoutes(app, appClients)
	app.Use(appClients.ViewNotFound)
}
