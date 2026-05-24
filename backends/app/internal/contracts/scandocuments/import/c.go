package importstudents

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
	api := apiGroup.Group("/import")
	controller := NewController(appClients)
	api.Get("/", controller.GetStudentsListAPI)
	api.Get("/columns", controller.GetStudentsColumns)
	api.Post("/import-students", controller.ImportStudents)
}
