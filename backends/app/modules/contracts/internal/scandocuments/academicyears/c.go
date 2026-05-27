package academicyears

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
	controller := NewController(appClients)
	api := apiGroup.Group("/academic-years")
	api.Get("/list", controller.GetListDataApi)
}
func SetupWebRoutes(app fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	app.Get("/", controller.GetListDataView)
}
