package render

import "github.com/gofiber/fiber/v3"

func RenderError(err error, listenAddress string) error {
	app := fiber.New()
	app.Use(func(c fiber.Ctx) error {
		return c.SendString(err.Error())
	})
	return app.Listen(listenAddress)
}

// WithTitle returns a functional option that sets the title for the render.
//
// Example:
//
//	return app.View(c, app.WithTitle("Hello, World!"))
func (app *Render) WithError(err error) RenderOptionsFunc {
	return func(o *RenderOptions) {
		o.err = err
		o.errorStatus = fiber.StatusInternalServerError
		o.errorCode = "INTERNAL_SERVER_ERROR"
	}
}

// WithStatus returns a functional option that sets the status for the render.
//
// Example:
//
//	return app.View(c, app.WithStatus(fiber.StatusNotFound))
func (app *Render) WithStatus(status int) RenderOptionsFunc {
	return func(o *RenderOptions) {
		o.errorStatus = status
	}
}
