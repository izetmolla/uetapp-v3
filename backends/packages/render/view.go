package render

import (
	"bytes"
	"text/template"

	"github.com/gofiber/fiber/v3"
)

func (r *Render) View(c fiber.Ctx, optsParams ...RenderOptionsFunc) error {
	opts := r.NewRender(optsParams...)

	// Set response headers
	c.Set("Content-Type", "text/html; charset=utf-8")
	if opts.errorStatus != 0 {
		c.Status(opts.errorStatus)
	} else {
		c.Status(fiber.StatusOK)
	}

	// Parse the template
	tmpl, err := template.New("index.html").Parse(r.prepareThemeString(opts))
	if err != nil {
		return c.SendString(staticErrorText(err))
	}

	// Execute template
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, r.prepareViewData(c, opts)); err != nil {
		return c.SendString(staticErrorText(err))
	}

	return c.SendString(buf.String())
}
