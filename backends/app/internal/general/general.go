package general

import (
	"github.com/gofiber/fiber/v3"
)

func (cc *Controller) GetGeneralDataApi(c fiber.Ctx) error {
	r := cc.app.Render()
	reqCtx := c.Context()
	generalData, err := cc.app.GeneralData(c, reqCtx, c.Query("service", cc.app.ServiceName()), true)
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}

	return cc.app.Api(c, r.WithContext(reqCtx), r.WithData(generalData))
}
