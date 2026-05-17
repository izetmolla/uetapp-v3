package routes

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
	"github.com/uetedu/app/internal/admin"
	"github.com/uetedu/app/internal/authorization"
	"github.com/uetedu/app/internal/cadmin"
	"github.com/uetedu/app/internal/enter"
	"github.com/uetedu/app/internal/general"
	"github.com/uetedu/app/internal/languages"
	"github.com/uetedu/app/internal/render"
	"github.com/uetedu/app/internal/secretary"
)

func SetupRoutes(app fiber.Router, appClients *config.AppClients) {
	auth := appClients.Auth()
	api := app.Group("/api")
	viewController := render.NewController(appClients)

	admin.SetupRoutes(api, appClients)
	languages.SetupRoutes(api, appClients)
	authorization.SetupRoutes(app, api, appClients)

	api.Use(auth.HandleRefreshToken)
	api.Use(auth.UseAPIAuthorization())
	app.Use(auth.UseWEBAuthorization())

	// Handle Routes based on the API group
	general.SetupRoutes(api, appClients)
	enter.SetupRoutes(app, api, appClients)

	// Cadmin Routes
	cadmin.SetupApiRoutes(api, appClients)
	cadmin.SetupWebRoutes(app, appClients)

	//Secretary Routes
	secretary.SetupApiRoutes(api, appClients)
	secretary.SetupWebRoutes(app, appClients)

	api.Use(appClients.ApiNotFound)
	app.Use(viewController.HandleDynamicPages)
}
