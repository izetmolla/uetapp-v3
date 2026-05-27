package enter

import (
	"github.com/gofiber/fiber/v3"
)

func (c *Controller) GetEnterDataApi(ctx fiber.Ctx) error {
	render := c.app.Render()
	claims, err := c.app.Auth().GetClaims(ctx)
	if err != nil {
		return c.app.Api(ctx, render.WithTitle(err.Error()))
	}
	return c.app.Api(ctx, render.WithTitle("Hello, World!"), render.WithData(fiber.Map{
		"claims": claims,
	}))
}

func (c *Controller) GetEnterDataView(ctx fiber.Ctx) error {
	render := c.app.Render()
	context := ctx.Context()
	return c.app.View(ctx,
		render.WithContext(context),
		render.WithTitle("UET App Dashboard"),
		render.WIthoutAuthentication(),
		render.WithData(map[string]any{
			"message": "Hello, World!",
		}))

}
