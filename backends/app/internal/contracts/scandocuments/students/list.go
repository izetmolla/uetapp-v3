package students

import (
	"context"
	"strconv"

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
	folderID := ctx.Query("folder_id")
	folderIDInt, err := strconv.ParseInt(folderID, 10, 64)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
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
	folder, err := c.getFolder(ctxPtr, folderIDInt)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	students, err := c.getStudents(ctxPtr, folder.ID)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	return c.app.Api(ctx, r.WithData(fiber.Map{
		"students":          students,
		"faculty":           &faculty,
		"academic_year":     &academicYear,
		"study_level_group": &studyLevelGroup,
		"folder":            &folder,
	}))
}
func (c *Controller) GetListDataView(ctx fiber.Ctx) error {
	ctxPtr := ctx.Context()
	r := c.app.Render()
	year := ctx.Params("year")
	facultySlug := ctx.Params("faculty_slug")
	groupID := ctx.Params("group_id")
	folderID := ctx.Params("folder_id")
	folderIDInt, err := strconv.ParseInt(folderID, 10, 64)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
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
	folder, err := c.getFolder(ctxPtr, folderIDInt)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	students, err := c.getStudents(ctxPtr, folder.ID)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	return c.app.View(ctx, r.WithData(fiber.Map{
		"students":          students,
		"faculty":           &faculty,
		"study_level_group": &studyLevelGroup,
		"academic_year":     &academicYear,
		"folder":            &folder,
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

func (c *Controller) getFolder(ctx context.Context, folderID int64) (*models.StudentScanFolder, error) {
	db := c.app.Postgres()
	folder, err := gorm.G[models.StudentScanFolder](db).
		Where("id = ?", folderID).
		First(ctx)
	if err != nil {
		return nil, err
	}
	return &folder, nil
}
func (c *Controller) getStudents(ctx context.Context, folderID int64) ([]models.StudentScanFolderDoc, error) {
	db := c.app.Postgres()
	students, err := gorm.G[models.StudentScanFolderDoc](db).
		Where(&models.StudentScanFolderDoc{
			StudentScanFolderID: folderID,
		}).
		Find(ctx)
	if err != nil {
		return nil, err
	}
	return students, nil
}
