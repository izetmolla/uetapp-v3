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

// Save1DemoApi accepts layout-builder demo form payloads (POST /api/save1).
func (cc *Controller) Save1DemoApi(c fiber.Ctx) error {
	r := cc.app.Render()
	var body map[string]any
	if err := c.Bind().Body(&body); err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusBadRequest))
	}

	firstName, _ := body["firstName"].(string)
	lastName, _ := body["lastName"].(string)
	if firstName == "" || lastName == "" {
		return cc.app.Api(c,
			r.WithStatus(fiber.StatusBadRequest),
			r.WithData(fiber.Map{
				"error":   true,
				"message": "First and last name are required",
				"details": fiber.Map{"field": "firstName"},
			}),
		)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"ok":      true,
		"message": "Profile saved",
		"saved":   body,
	}))
}
