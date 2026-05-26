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
	groupID := ctx.Query("group_id")

	academicYear, err := c.getAcademicYear(ctxPtr, year)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	faculty, err := c.getFaculty(ctxPtr, facultySlug)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	studyLevelGroup, err := c.getStudyLevelGroup(ctxPtr, groupID)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	folders, stats, err := c.listFoldersWithStats(ctxPtr, academicYear.ID, faculty.ID, studyLevelGroup.ID)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	return c.app.Api(ctx, r.WithData(fiber.Map{
		"folders":           folders,
		"stats":             stats,
		"faculty":           &faculty,
		"academic_year":     &academicYear,
		"study_level_group": &studyLevelGroup,
	}))
}
func (c *Controller) GetListDataView(ctx fiber.Ctx) error {
	ctxPtr := ctx.Context()
	r := c.app.Render()
	year := ctx.Params("year")
	facultySlug := ctx.Params("faculty_slug")
	groupID := ctx.Params("group_id")

	academicYear, err := c.getAcademicYear(ctxPtr, year)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	faculty, err := c.getFaculty(ctxPtr, facultySlug)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	studyLevelGroup, err := c.getStudyLevelGroup(ctxPtr, groupID)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	folders, stats, err := c.listFoldersWithStats(ctxPtr, academicYear.ID, faculty.ID, studyLevelGroup.ID)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	return c.app.View(ctx, r.WithData(fiber.Map{
		"folders":           folders,
		"stats":             stats,
		"faculty":           &faculty,
		"academic_year":     &academicYear,
		"study_level_group": &studyLevelGroup,
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
func (c *Controller) getStudyLevelGroup(ctx context.Context, groupID string) (*models.StudentScanLevelGroup, error) {
	db := c.app.Postgres()
	studyLevelGroup, err := gorm.G[models.StudentScanLevelGroup](db).
		Where("id = ?", groupID).
		First(ctx)
	if err != nil {
		return nil, err
	}
	return &studyLevelGroup, nil
}
