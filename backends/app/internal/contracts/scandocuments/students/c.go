package students

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
	api := apiGroup.Group("/students")
	api.Get("/list", controller.GetListDataApi)
	api.Get("/search", controller.SearchStudents)
	api.Post("/", controller.CreateFolder)
	api.Post("/add-student-to-scan", controller.AddStudentToScanAPI)
	api.Get("/work-students-list", controller.WorkStudentsListAPI)
}

func SetupWebRoutes(app fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	app.Get("/:year/:faculty_slug/:level_slug/:folder_id", controller.GetListDataView)
}
