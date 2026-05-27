package list

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
	api.Get("/", controller.GetStudentsListAPI)
	api.Get("/columns", controller.GetStudentsColumns)
	api.Get("/stats", controller.GetStudentsStatsAPI)
	api.Get("/new", controller.GetStudentCreateTemplate)
	api.Post("/", controller.CreateStudent)
	api.Post("/disable", controller.DisableStudents)
	api.Post("/enable", controller.EnableStudents)
	api.Get("/:id", controller.GetStudentDetail)
	api.Put("/:id", controller.UpdateStudent)
	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(app fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	app.Get("/", controller.GetStudentsListView)
}
