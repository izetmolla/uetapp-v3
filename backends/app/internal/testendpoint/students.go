package testendpoint

import (
	"github.com/flowtrove/packages/drivers/httprequest"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (cc *Controller) GetStudentsListAPI(c fiber.Ctx) error {
	reqCtx := c.Context()
	db := cc.app.Postgres()
	r := cc.app.Render()

	resource, err := gorm.G[models.Resource](db).
		Select("id", "config").
		Where("id = ?", 3).
		First(reqCtx)
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}

	res, err := httprequest.Execute[map[string]any](httprequest.New(&httprequest.HttpRequestDriver{
		Url:    resource.Config["url"].(string),
		Method: resource.Config["method"].(string),
		Headers: map[string]string{
			"Content-Type":  "application/json",
			"Authorization": "Bearer " + resource.Config["authorization"].(string),
		},
		Params: map[string]any{
			"action":  "getStudents",
			"keyword": "izet molla",
			"page":    1,
			"perPage": 10,
		},
	}))
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}
	return cc.app.Api(c, cc.app.Render().WithData(fiber.Map{
		"content": res.Body,
	}))
}
