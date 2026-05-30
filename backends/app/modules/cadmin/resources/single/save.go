package single

import (
	"errors"
	"strconv"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (c *Controller) SaveResourceAPI(ctx fiber.Ctx) error {
	r := c.app.Render()
	var body map[string]any
	if err := ctx.Bind().JSON(&body); err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusBadRequest), r.WithCode("BAD_REQUEST"))
	}

	id, err := parseBodyID(body["id"])
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusBadRequest), r.WithCode("BAD_REQUEST"))
	}

	config, err := configFromBody(body)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusBadRequest), r.WithCode("BAD_REQUEST"))
	}
	delete(config, "id")

	db := c.app.Postgres()
	result := db.Model(&models.Resource{}).Where("id = ?", id).Update("config", config)
	if result.Error != nil {
		return c.app.Api(ctx, r.WithError(result.Error), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	if result.RowsAffected == 0 {
		return c.app.Api(ctx, r.WithError(errors.New("resource not found")), r.WithStatus(fiber.StatusNotFound), r.WithCode("NOT_FOUND"))
	}

	resource, err := gorm.G[models.Resource](db).Where("id = ?", id).First(ctx.Context())
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	return c.app.Api(ctx, r.WithData(fiber.Map{
		"success":  true,
		"message":  "Resource saved successfully",
		"resource": resource,
	}))
}

func parseBodyID(raw any) (int64, error) {
	switch v := raw.(type) {
	case string:
		return strconv.ParseInt(v, 10, 64)
	case float64:
		return int64(v), nil
	case int64:
		return v, nil
	case int:
		return int64(v), nil
	default:
		return 0, errors.New("invalid resource id")
	}
}

func configFromBody(body map[string]any) (models.JSONBAny, error) {
	if raw, ok := body["config"]; ok {
		return parseConfigMap(raw)
	}
	config := make(models.JSONBAny)
	for k, v := range body {
		if k == "id" {
			continue
		}
		config[k] = v
	}
	if len(config) == 0 {
		return nil, errors.New("invalid config")
	}
	return config, nil
}

func parseConfigMap(raw any) (models.JSONBAny, error) {
	if raw == nil {
		return models.JSONBAny{}, nil
	}
	m, ok := raw.(map[string]any)
	if !ok {
		return nil, errors.New("invalid config")
	}
	return models.JSONBAny(m), nil
}
