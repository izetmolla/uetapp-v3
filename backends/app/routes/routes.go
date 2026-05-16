package routes

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
	"github.com/uetedu/app/internal/authorization"
	"github.com/uetedu/app/internal/enter"
	"github.com/uetedu/app/internal/languages"
	"github.com/uetedu/app/internal/render"
)

func SetupRoutes(app fiber.Router, appClients *config.AppClients) {
	auth := appClients.Auth()
	api := app.Group("/api")
	viewController := render.NewController(appClients)

	languages.SetupRoutes(api, appClients)
	authorization.SetupRoutes(app, api, appClients)

	api.Use(auth.HandleRefreshToken)
	api.Use(auth.UseAPIAuthorization())
	app.Use(auth.UseWEBAuthorization())

	// Handle Routes based on the API group
	enter.SetupRoutes(app, api, appClients)

	api.Use(appClients.ApiNotFound)
	app.Use(viewController.HandleDynamicPages)
}
