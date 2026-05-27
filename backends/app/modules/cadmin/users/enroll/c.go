package enroll

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
)

type Controller struct {
	app *config.AppClients
}

func NewController(app *config.AppClients) *Controller {
	return &Controller{app: app}
}

func SetupApiRoutes(apiGroup fiber.Router, appClients *config.AppClients) {
	api := apiGroup.Group("/enroll")
	controller := NewController(appClients)
	api.Get("/template", controller.GetCSVTemplate)
	api.Post("/preview", controller.PreviewCSVUpload)
	api.Post("/apply", controller.ApplyCSVChanges)
}

func SetupWebRoutes(appGroup fiber.Router, appClients *config.AppClients) {
	app := appGroup.Group("/enroll")
	app.Get("/", appClients.WebView("Enroll Users"))
}
