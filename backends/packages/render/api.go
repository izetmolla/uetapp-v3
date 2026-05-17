package render

import "github.com/gofiber/fiber/v3"

func (r *Render) Api(c fiber.Ctx, optsParams ...RenderOptionsFunc) error {
	var res map[string]any
	opts := r.NewRender(optsParams...)

	c.Set("Content-Type", "application/json; charset=utf-8")
	if opts.errorStatus != 0 {
		c.Status(opts.errorStatus)
	}
	if opts.data != nil {
		return c.JSON(opts.data)
	}

	// Set response headers
	if opts.err != nil {
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{
			"error":   true,
			"message": opts.err.Error(),
			"code":    opts.errorCode,
			"status":  opts.errorStatus,
			"details": opts.errorDetails,
		})
	}

	return c.JSON(res)
}
