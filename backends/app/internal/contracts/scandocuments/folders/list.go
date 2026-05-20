package folders

import (
	"context"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (c *Controller) GetListDataApi(ctx fiber.Ctx) error {
	ctxPtr := ctx.Context()
	r := c.app.Render()
	year := ctx.Query("year")
	facultySlug := ctx.Query("faculty_slug")
	levelSlug := ctx.Query("level_slug")

	academicYear, err := c.getAcademicYear(ctxPtr, year)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	faculty, err := c.getFaculty(ctxPtr, facultySlug)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	studyLevel, err := c.getStudyLevel(ctxPtr, levelSlug)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	folders, stats, err := c.listFoldersWithStats(ctxPtr, academicYear.ID, faculty.ID, studyLevel.ID)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	return c.app.Api(ctx, r.WithData(fiber.Map{
		"folders":       folders,
		"stats":         stats,
		"faculty":       &faculty,
		"academic_year": &academicYear,
		"study_level":   &studyLevel,
	}))
}
func (c *Controller) GetListDataView(ctx fiber.Ctx) error {
	ctxPtr := ctx.Context()
	r := c.app.Render()
	year := ctx.Params("year")
	facultySlug := ctx.Params("faculty_slug")
	levelSlug := ctx.Params("level_slug")

	academicYear, err := c.getAcademicYear(ctxPtr, year)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	faculty, err := c.getFaculty(ctxPtr, facultySlug)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	studyLevel, err := c.getStudyLevel(ctxPtr, levelSlug)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	folders, stats, err := c.listFoldersWithStats(ctxPtr, academicYear.ID, faculty.ID, studyLevel.ID)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	return c.app.View(ctx, r.WithData(fiber.Map{
		"folders":     folders,
		"stats":       stats,
		"study_level": &studyLevel,
		"faculty":     &faculty,
	}))
}

func (c *Controller) getAcademicYear(ctx context.Context, year string) (*models.AcademicYear, error) {
	db := c.app.Postgres()
	academicYear, err := gorm.G[models.AcademicYear](db).
		Where("year = ?", year).
		First(ctx)
	if err != nil {
		return nil, err
	}
	return &academicYear, nil
}

func (c *Controller) getFaculty(ctx context.Context, facultySlug string) (*models.Faculty, error) {
	db := c.app.Postgres()
	faculty, err := gorm.G[models.Faculty](db).
		Where("slug = ?", facultySlug).
		First(ctx)
	if err != nil {
		return nil, err
	}
	return &faculty, nil
}
func (c *Controller) getStudyLevel(ctx context.Context, levelSlug string) (*models.StudyLevel, error) {
	db := c.app.Postgres()
	studyLevel, err := gorm.G[models.StudyLevel](db).
		Where("slug = ?", levelSlug).
		First(ctx)
	if err != nil {
		return nil, err
	}
	return &studyLevel, nil
}
