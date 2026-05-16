package render

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

func (c *Controller) Index(ctx fiber.Ctx) error {
	return c.app.View(ctx, c.app.Render().WithTitle("Home"))
}

func (c *Controller) HandleDynamicPages(ctx fiber.Ctx) error {
	render := c.app.Render()
	context := ctx.Context()
	return c.app.View(ctx, render.WithContext(context), render.WithTitle("Home"), render.WithData(map[string]any{
		"message": "Hello, World!",
	}))
}
