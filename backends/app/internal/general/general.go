package general

import (
	"github.com/gofiber/fiber/v3"
)

func (cc *Controller) GetGeneralDataApi(c fiber.Ctx) error {
	render := cc.app.Render()
	reqCtx := c.Context()

	generalData, err := cc.app.GeneralData(reqCtx, c.Query("service", cc.app.ServiceName()))
	if err != nil {
		return cc.app.Api(c, render.WithError(err))
	}

	return cc.app.Api(c,
		render.WithContext(reqCtx),
		render.WithTitle("General Data"),
		render.WithData(generalData),
	)
}
