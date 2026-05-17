package profile

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
	controller := NewController(appClients)
	api := apiGroup.Group("/profile")
	api.Get("/", controller.GetProfile)
	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(appGroup fiber.Router, appClients *config.AppClients) {
	app := appGroup.Group("/profile")
	app.Get("/", appClients.WebView("Profile"))
	app.Use(appClients.ViewNotFound)
}

func (c *Controller) GetProfile(ctx fiber.Ctx) error {
	return ctx.JSON(fiber.Map{
		"message": "Profile",
	})
}
