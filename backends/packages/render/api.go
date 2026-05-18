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

	if opts.err != nil {
		status := opts.errorStatus
		if status == 0 {
			status = fiber.StatusInternalServerError
		}
		c.Status(status)
		code := opts.errorCode
		if code == "" {
			code = "INTERNAL_SERVER_ERROR"
		}
		return c.JSON(fiber.Map{
			"error":   true,
			"message": opts.err.Error(),
			"code":    code,
			"status":  status,
			"details": opts.errorDetails,
		})
	}

	return c.JSON(res)
}
