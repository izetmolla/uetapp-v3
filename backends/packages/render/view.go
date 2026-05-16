package render

import (
	"fmt"

	"github.com/gofiber/fiber/v3"
)

func (r *Render) View(c fiber.Ctx, optsParams ...RenderOptionsFunc) error {
	opts := r.NewRender(optsParams...)

	// Set response headers
	c.Set("Content-Type", "text/html; charset=utf-8")

	return c.SendString(fmt.Sprintf("Hello, %s!", opts.Title))
}
