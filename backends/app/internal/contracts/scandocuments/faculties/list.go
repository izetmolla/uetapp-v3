package faculties

import (
	"context"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (c *Controller) GetListDataApi(ctx fiber.Ctx) error {
	ctxPtr := ctx.Context()
	r := c.app.Render()
	faculties, err := c.getFaculties(ctxPtr)
	if err != nil {
		return c.app.Api(ctx,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}
	return c.app.Api(ctx, r.WithData(fiber.Map{
		"faculties": faculties,
	}))
}
func (c *Controller) GetListDataView(ctx fiber.Ctx) error {
	ctxPtr := ctx.Context()
	r := c.app.Render()
	faculties, err := c.getFaculties(ctxPtr)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	return c.app.View(ctx, r.WithData(fiber.Map{
		"faculties": faculties,
	}))
}

func (c *Controller) getFaculties(ctx context.Context) ([]map[string]any, error) {
	res := make([]map[string]any, 0)
	db := c.app.Postgres()
	faculties, err := gorm.G[models.Faculty](db).
		Order("id DESC").
		Find(ctx)
	if err != nil {
		return nil, err
	}
	for _, faculty := range faculties {
		res = append(res, map[string]any{
			"id":         int(faculty.ID),
			"slug":       faculty.Slug,
			"name":       faculty.Name,
			"short":      faculty.Short,
			"students":   faculty.Students,
			"folders":    faculty.Folders,
			"completion": faculty.Completion,
			"accent":     faculty.Accent,
			"icon":       faculty.Icon,
		})
	}

	return res, nil
}
