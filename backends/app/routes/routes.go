package routes

import (
	"github.com/flowtrove/app/config"
	"github.com/flowtrove/app/internal/authorization"
	"github.com/flowtrove/app/internal/enter"
	"github.com/flowtrove/app/internal/languages"
	"github.com/flowtrove/app/internal/render"
	"github.com/gofiber/fiber/v3"
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
