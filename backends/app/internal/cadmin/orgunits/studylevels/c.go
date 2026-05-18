package studylevels

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
	api := apiGroup.Group("/list")
	controller := NewController(appClients)
	api.Get("/", controller.GetStudyLevelsListAPI)
	api.Get("/columns", controller.GetStudyLevelsColumns)
	api.Post("/", controller.CreateStudyLevel)
	api.Put("/:id", controller.UpdateStudyLevel)
	api.Delete("/", controller.DeleteStudyLevels)
	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(app fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	app.Get("/", controller.GetStudyLevelsListView)
}
