package academicyears

import (
	"context"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (c *Controller) GetListDataApi(ctx fiber.Ctx) error {
	ctxPtr := ctx.Context()
	r := c.app.Render()
	academic_years, err := c.getAcademicYears(ctxPtr)
	if err != nil {
		return c.app.Api(ctx,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}
	return c.app.Api(ctx, r.WithData(fiber.Map{
		"academic_years": academic_years,
	}))
}
func (c *Controller) GetListDataView(ctx fiber.Ctx) error {
	ctxPtr := ctx.Context()
	r := c.app.Render()
	academic_years, err := c.getAcademicYears(ctxPtr)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	return c.app.View(ctx, r.WithData(fiber.Map{
		"academic_years": academic_years,
	}))
}

func (c *Controller) getAcademicYears(ctx context.Context) ([]map[string]any, error) {
	res := make([]map[string]any, 0)
	db := c.app.Postgres()
	academicYears, err := gorm.G[models.AcademicYear](db).
		Order("id DESC").
		Find(ctx)
	if err != nil {
		return nil, err
	}
	for _, academicYear := range academicYears {
		res = append(res, map[string]any{
			"id":         academicYear.ID,
			"year":       academicYear.Year,
			"folders":    academicYear.Folders,
			"students":   academicYear.Students,
			"faculties":  academicYear.Faculties,
			"completion": academicYear.Completion,
			"status":     academicYear.Status,
			"accent":     academicYear.Accent,
		})
	}

	return res, nil
}
