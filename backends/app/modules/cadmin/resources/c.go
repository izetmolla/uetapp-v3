package resources

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
	"github.com/uetedu/app/modules/cadmin/resources/list"
	"github.com/uetedu/app/modules/cadmin/resources/single"
)

func SetupApiRoutes(apiGroup fiber.Router, appClients *config.AppClients) {
	api := apiGroup.Group("/resources")
	list.SetupApiRoutes(api, appClients)
	single.SetupApiRoutes(api, appClients)
	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(appGroup fiber.Router, appClients *config.AppClients) {
	app := appGroup.Group("/resources")
	list.SetupWebRoutes(app, appClients)
	single.SetupWebRoutes(app, appClients)
	app.Use(appClients.ViewNotFound)
}
