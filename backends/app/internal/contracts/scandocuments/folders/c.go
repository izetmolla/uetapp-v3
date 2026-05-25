package folders

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
	"github.com/uetedu/app/internal/contracts/scandocuments/folders/device"
)

type Controller struct {
	app *config.AppClients
}

func NewController(app *config.AppClients) *Controller {
	return &Controller{app: app}
}

func SetupApiRoutes(apiGroup fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	api := apiGroup.Group("/folders")
	device.SetupApiRoutes(api, appClients)
	api.Get("/list", controller.GetListDataApi)
	api.Post("/", controller.CreateFolder)
	api.Get("/:id/download", controller.DownloadFolder)
	api.Delete("/:id", controller.DeleteFolder)
}
func SetupWebRoutes(app fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	app.Get("/:year/:faculty_slug/:level_slug", controller.GetListDataView)
}
