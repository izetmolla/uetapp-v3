package scandocuments

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
	"github.com/uetedu/app/internal/contracts/scandocuments/academicyears"
	"github.com/uetedu/app/internal/contracts/scandocuments/faculties"
	"github.com/uetedu/app/internal/contracts/scandocuments/folders"
	importstudents "github.com/uetedu/app/internal/contracts/scandocuments/import"
	"github.com/uetedu/app/internal/contracts/scandocuments/students"
	"github.com/uetedu/app/internal/contracts/scandocuments/studylevels"
)

type Controller struct {
	app *config.AppClients
}

func NewController(app *config.AppClients) *Controller {
	return &Controller{app: app}
}

func SetupApiRoutes(apiGroup fiber.Router, appClients *config.AppClients) {
	api := apiGroup.Group("/scandocuments")
	importstudents.SetupApiRoutes(api, appClients) //for Importing students from a "HATHENAJA E LESHIT"
	academicyears.SetupApiRoutes(api, appClients)
	faculties.SetupApiRoutes(api, appClients)
	studylevels.SetupApiRoutes(api, appClients)
	folders.SetupApiRoutes(api, appClients)
	students.SetupApiRoutes(api, appClients)

}

func SetupWebRoutes(app fiber.Router, appClients *config.AppClients) {
	appGroup := app.Group("/scandocuments")
	academicyears.SetupWebRoutes(appGroup, appClients)
	faculties.SetupWebRoutes(appGroup, appClients)
	studylevels.SetupWebRoutes(appGroup, appClients)
	folders.SetupWebRoutes(appGroup, appClients)
	students.SetupWebRoutes(appGroup, appClients)
}
