package general

import (
	"errors"

	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
)

func (cc *Controller) GetGeneralDataApi(c fiber.Ctx) error {
	r := cc.app.Render()
	reqCtx := c.Context()
	generalData, err := cc.app.GeneralData(c, reqCtx, c.Query("service", cc.app.ServiceName()), true)
	if err != nil {
		if errors.Is(err, config.ErrServiceAccessDenied) {
			return cc.app.Api(c,
				r.WithError(err),
				r.WithStatus(fiber.StatusForbidden),
				r.WithCode("INSUFFICIENT_PERMISSIONS"),
			)
		}
		return cc.app.Api(c, r.WithError(err))
	}

	return cc.app.Api(c, r.WithContext(reqCtx), r.WithData(generalData))
}
