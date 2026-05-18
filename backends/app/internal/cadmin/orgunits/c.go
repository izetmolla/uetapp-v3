package orgunits

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
	"github.com/uetedu/app/internal/cadmin/orgunits/academicyears"
	"github.com/uetedu/app/internal/cadmin/orgunits/departments"
	"github.com/uetedu/app/internal/cadmin/orgunits/faculties"
	"github.com/uetedu/app/internal/cadmin/orgunits/list"
	"github.com/uetedu/app/internal/cadmin/orgunits/studylevels"
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
	api := apiGroup.Group("/orgunits")
	list.SetupApiRoutes(api, appClients)

	academicYearsAPI := api.Group("/academicyears")
	academicyears.SetupApiRoutes(academicYearsAPI, appClients)

	facultiesAPI := api.Group("/faculties")
	faculties.SetupApiRoutes(facultiesAPI, appClients)

	departmentsAPI := api.Group("/departments")
	departments.SetupApiRoutes(departmentsAPI, appClients)

	studyLevelsAPI := api.Group("/studylevels")
	studylevels.SetupApiRoutes(studyLevelsAPI, appClients)

	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(appGroup fiber.Router, appClients *config.AppClients) {
	app := appGroup.Group("/orgunits")
	list.SetupWebRoutes(app, appClients)

	academicYearsWeb := app.Group("/academicyears")
	academicyears.SetupWebRoutes(academicYearsWeb, appClients)

	facultiesWeb := app.Group("/faculties")
	faculties.SetupWebRoutes(facultiesWeb, appClients)

	departmentsWeb := app.Group("/departments")
	departments.SetupWebRoutes(departmentsWeb, appClients)

	studyLevelsWeb := app.Group("/studylevels")
	studylevels.SetupWebRoutes(studyLevelsWeb, appClients)

	app.Use(appClients.ViewNotFound)
}
