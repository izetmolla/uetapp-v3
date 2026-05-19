package list

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
	api := apiGroup.Group("/list")
	controller := NewController(appClients)
	api.Get("/", controller.GetUsersListAPI)
	api.Get("/columns", controller.GetUsersColumns)
	api.Get("/stats", controller.GetUsersStatsAPI)
	api.Get("/new", controller.GetUserCreateTemplate)
	api.Post("/", controller.CreateUser)
	api.Post("/disable", controller.DisableUsers)
	api.Post("/enable", controller.EnableUsers)
	api.Get("/:id", controller.GetUserDetail)
	api.Put("/:id/general", controller.UpdateUserGeneral)
	api.Put("/:id/password", controller.UpdateUserPassword)
	api.Put("/:id/roles", controller.UpdateUserRoles)
	api.Put("/:id", controller.QuickUpdateUser)
	api.Delete("/", controller.DeleteUsers)
	// app.Get("/", controller.GetEnterDataView) // Web endpoint for getting enter data

	// api.Get("/enter", controller.GetEnterDataApi) // API endpoint for getting enter data
	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(app fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	app.Get("/", controller.GetUsersListView)
}
