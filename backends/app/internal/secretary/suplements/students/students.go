package students

import (
	"github.com/gofiber/fiber/v3"
)

func (c *Controller) GetStudentsListApi(ctx fiber.Ctx) error {
	r := c.app.Render()

	return c.app.Api(ctx, r.WithData(fiber.Map{
		"students":  []any{},
		"pageCount": 0,
		"templates": []any{},
		"options": fiber.Map{
			"filter_items": []any{},
			"filters":      []string{},
			"columns":      []string{},
		},
	}))
}

func (c *Controller) GetStudentsListView(ctx fiber.Ctx) error {
	return c.app.View(ctx, c.app.Render().WithData(fiber.Map{}))
}
