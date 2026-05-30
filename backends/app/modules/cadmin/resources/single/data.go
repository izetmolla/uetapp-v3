package single

import (
	"context"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (c *Controller) GetResourceDetailAPI(ctx fiber.Ctx) error {
	r := c.app.Render()
	id := ctx.Query("id")
	data, err := c.getResourceData(ctx.Context(), id)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	return c.app.Api(ctx, r.WithData(data))
}

func (c *Controller) GetResourceDetailView(ctx fiber.Ctx) error {
	r := c.app.Render()
	id := ctx.Params("id")
	data, err := c.getResourceData(ctx.Context(), id)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	return c.app.Api(ctx, r.WithData(data))
}

func (c *Controller) getResourceData(ctx context.Context, id string) (map[string]any, error) {
	res := make(map[string]any)
	db := c.app.Postgres()
	resource, err := gorm.G[models.Resource](db).Where("id = ?", id).First(ctx)
	if err != nil {
		return nil, err
	}
	res["resource"] = resource
	return res, nil
}
