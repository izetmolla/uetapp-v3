package roles

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
	api := apiGroup.Group("/roles")
	controller := NewController(appClients)
	api.Get("/", controller.GetRolesListAPI)
	api.Get("/columns", controller.GetRolesColumns)
	api.Get("/stats", controller.GetRolesStatsAPI)
	api.Get("/new", controller.GetRoleCreateTemplate)
	api.Post("/", controller.CreateRole)
	api.Post("/disable", controller.DisableRoles)
	api.Post("/enable", controller.EnableRoles)
	api.Delete("/", controller.DeleteRoles)
	api.Get("/:id", controller.GetRoleDetail)
	api.Put("/:id", controller.UpdateRole)
	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(app fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	app.Get("/", controller.GetRolesListView)
}
