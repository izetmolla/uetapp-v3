package studylevels

import (
	"context"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (c *Controller) GetListDataApi(ctx fiber.Ctx) error {
	ctxPtr := ctx.Context()
	r := c.app.Render()
	facultySlug := ctx.Query("faculty_slug")
	study_levels, err := c.getStudyLevels(ctxPtr)
	if err != nil {
		return c.app.Api(ctx,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}
	faculty, err := c.getFacultyBySlug(ctxPtr, facultySlug)
	if err != nil {
		return c.app.Api(ctx,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	return c.app.Api(ctx, r.WithData(fiber.Map{
		"study_levels": study_levels,
		"faculty":      faculty,
	}))
}
func (c *Controller) GetListDataView(ctx fiber.Ctx) error {
	ctxPtr := ctx.Context()
	r := c.app.Render()
	facultySlug := ctx.Params("faculty_slug")
	study_levels, err := c.getStudyLevels(ctxPtr)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	faculty, err := c.getFacultyBySlug(ctxPtr, facultySlug)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	return c.app.View(ctx, r.WithData(fiber.Map{
		"study_levels": study_levels,
		"faculty":      &faculty,
	}))
}

func (c *Controller) getStudyLevels(ctx context.Context) ([]map[string]any, error) {
	res := make([]map[string]any, 0)
	db := c.app.Postgres()
	studyLevels, err := gorm.G[models.StudyLevel](db).
		Order("id DESC").
		Find(ctx)
	if err != nil {
		return nil, err
	}
	for _, studyLevel := range studyLevels {
		res = append(res, map[string]any{
			"id":          int(studyLevel.ID),
			"slug":        studyLevel.Slug,
			"name":        studyLevel.Name,
			"description": studyLevel.Description,
			"duration":    studyLevel.Duration,
			"students":    studyLevel.Students,
			"group":       studyLevel.Group,
			"icon":        studyLevel.Icon,
			"accent":      studyLevel.Accent,
		})
	}

	return res, nil
}
func (c *Controller) getFacultyBySlug(ctx context.Context, facultySlug string) (*models.Faculty, error) {
	db := c.app.Postgres()
	faculty, err := gorm.G[models.Faculty](db).
		Where("slug = ?", facultySlug).
		First(ctx)
	if err != nil {
		return nil, err
	}
	return &faculty, nil
}
