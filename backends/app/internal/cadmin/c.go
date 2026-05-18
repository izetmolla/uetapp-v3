package cadmin

import (
	"errors"
	"fmt"

	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
	"github.com/uetedu/app/internal/cadmin/orgunits"
	"github.com/uetedu/app/internal/cadmin/resources"
	"github.com/uetedu/app/internal/cadmin/users"
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
	controller := NewController(appClients)
	api := apiGroup.Group("/cadmin", controller.CadminMiddlewareApi)
	users.SetupApiRoutes(api, appClients)
	orgunits.SetupApiRoutes(api, appClients)
	resources.SetupApiRoutes(api, appClients)

	// app.Get("/", controller.GetEnterDataView) // Web endpoint for getting enter data

	// api.Get("/enter", controller.GetEnterDataApi) // API endpoint for getting enter data
	api.Use(appClients.ApiNotFound)
}

func SetupWebRoutes(appGroup fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	app := appGroup.Group("/cadmin", controller.CadminMiddlewareView)
	users.SetupWebRoutes(app, appClients)
	orgunits.SetupWebRoutes(app, appClients)
	resources.SetupWebRoutes(app, appClients)
	app.Get("/", appClients.WebView("Cadmin")) // Web endpoint for getting enter data

	// api.Get("/enter", controller.GetEnterDataApi) // API endpoint for getting enter data
	app.Use(appClients.ViewNotFound)
}

func (cc *Controller) CadminMiddlewareApi(c fiber.Ctx) error {
	render := cc.app.Render()
	reqCtx := c.Context()
	user, err := cc.app.USER(c, reqCtx, true)
	if err != nil {
		return cc.app.Api(c, render.WithError(err), render.WithStatus(fiber.StatusUnauthorized), render.WithCode("UNAUTHORIZED"))
	}
	fmt.Println("user", user)
	hasRole, _, _ := cc.app.GetRole([]string{"admin"}, user.Roles)
	if !hasRole {
		return cc.app.Api(c, render.WithError(errors.New("unauthorized")), render.WithStatus(fiber.StatusUnauthorized), render.WithCode("UNAUTHORIZED"))
	}
	c.Locals("user", user)
	return c.Next()
}

func (cc *Controller) CadminMiddlewareView(c fiber.Ctx) error {
	render := cc.app.Render()
	reqCtx := c.Context()
	user, err := cc.app.USER(c, reqCtx, false)
	if err != nil {
		return cc.app.View(c, render.WithError(err), render.WithStatus(fiber.StatusUnauthorized), render.WithCode("UNAUTHORIZED"))
	}
	hasRole, r, w := cc.app.GetRole([]string{"admin"}, user.Roles)
	fmt.Println("hasRole", hasRole, "r", r, "w", w)
	if !hasRole {
		return cc.app.View(c, render.WithError(errors.New("unauthorized")), render.WithStatus(fiber.StatusUnauthorized), render.WithCode("UNAUTHORIZED"))
	}
	c.Locals("user", user)
	return c.Next()
}
