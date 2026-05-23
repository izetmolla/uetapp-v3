package students

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
	importstudents "github.com/uetedu/app/internal/contracts/students/import"
	"github.com/uetedu/app/internal/contracts/students/list"
)

func SetupApiRoutes(apiGroup fiber.Router, appClients *config.AppClients) {
	api := apiGroup.Group("/students")
	list.SetupApiRoutes(api, appClients)
	importstudents.SetupApiRoutes(api, appClients)
	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(appGroup fiber.Router, appClients *config.AppClients) {
	app := appGroup.Group("/students")
	list.SetupWebRoutes(app, appClients)

	app.Get("/", appClients.WebView("Students"))
	app.Use(appClients.ViewNotFound)
}
