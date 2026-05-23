package testendpoint

import (
	"github.com/flowtrove/packages/drivers/httprequest"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
	"gorm.io/gorm"
)

type Controller struct {
	app *config.AppClients
}

func NewController(app *config.AppClients) *Controller {
	return &Controller{
		app: app,
	}
}

func SetupRoutes(api fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	// api.Get("/test/httprequest", controller.TestEndpoint)
	api.Get("/test/university-unit", controller.GetUniversityUnit)
}

func (cc *Controller) TestEndpoint(c fiber.Ctx) error {
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
		// Body: map[string]any{
		// 	"action": "getStudent",
		// },
		Params: map[string]string{
			"action":  "getUsers",
			"keyword": "izet molla",
		},
	}))
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}

	return c.JSON(fiber.Map{
		"status_code": res.StatusCode,
		"status":      res.Status,
		"response":    res.Body,
	})
}
