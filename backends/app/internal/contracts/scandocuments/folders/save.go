package folders

import (
	"errors"
	"strconv"
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

type saveFolderPayload struct {
	Name        string `json:"name"`
	ID          string `json:"id"`
	Year        string `json:"year"`
	FacultySlug string `json:"faculty_slug"`
	LevelSlug   string `json:"level_slug"`
}

func (c *Controller) SaveFolder(ctx fiber.Ctx) error {
	r := c.app.Render()
	ctxPtr := ctx.Context()

	var payload saveFolderPayload
	if err := ctx.Bind().JSON(&payload); err != nil {
		return c.app.Api(ctx,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	year := strings.TrimSpace(payload.Year)
	facultySlug := strings.TrimSpace(payload.FacultySlug)
	levelSlug := strings.TrimSpace(payload.LevelSlug)
	if year == "" || facultySlug == "" || levelSlug == "" {
		return c.app.Api(ctx,
			r.WithError(errors.New("year, faculty_slug, and level_slug are required")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	name := strings.TrimSpace(payload.Name)
	if name == "" {
		return c.app.Api(ctx,
			r.WithError(errors.New("name is required")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}
	if len(name) > 255 {
		return c.app.Api(ctx,
			r.WithError(errors.New("name must be at most 255 characters")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	academicYear, err := c.getAcademicYear(ctxPtr, year)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusNotFound), r.WithCode("NOT_FOUND"))
	}
	faculty, err := c.getFaculty(ctxPtr, facultySlug)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusNotFound), r.WithCode("NOT_FOUND"))
	}
	studyLevel, err := c.getStudyLevel(ctxPtr, levelSlug)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusNotFound), r.WithCode("NOT_FOUND"))
	}

	db := c.app.Postgres()
	folderID, _ := strconv.ParseInt(strings.TrimSpace(payload.ID), 10, 64)

	if folderID > 0 {
		return c.updateFolder(ctx, db.WithContext(ctxPtr), folderID, name, academicYear.ID, faculty.ID, studyLevel.ID)
	}

	return c.createFolderRecord(ctx, db.WithContext(ctxPtr), name, academicYear.ID, faculty.ID, studyLevel.ID)
}

func (c *Controller) createFolderRecord(
	ctx fiber.Ctx,
	db *gorm.DB,
	name string,
	academicYearID, facultyID, studyLevelID int64,
) error {
	r := c.app.Render()

	var count int64
	if err := db.Model(&models.StudentScanFolder{}).
		Where("academic_year_id = ? AND faculty_id = ? AND study_level_id = ? AND name = ?",
			academicYearID, facultyID, studyLevelID, name).
		Count(&count).Error; err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	if count > 0 {
		return c.app.Api(ctx,
			r.WithError(errors.New("a folder with this name already exists")),
			r.WithStatus(fiber.StatusConflict),
			r.WithCode("CONFLICT"),
		)
	}

	folder := models.StudentScanFolder{
		Name:           name,
		AcademicYearID: academicYearID,
		FacultyID:      facultyID,
		StudyLevelID:   studyLevelID,
	}
	if err := db.Create(&folder).Error; err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	return c.app.Api(ctx, r.WithData(fiber.Map{
		"success": true,
		"message": "Folder created successfully",
		"folder":  folder,
	}))
}

func (c *Controller) updateFolder(
	ctx fiber.Ctx,
	db *gorm.DB,
	folderID int64,
	name string,
	academicYearID, facultyID, studyLevelID int64,
) error {
	r := c.app.Render()

	var folder models.StudentScanFolder
	if err := db.
		Where("id = ? AND academic_year_id = ? AND faculty_id = ? AND study_level_id = ?",
			folderID, academicYearID, facultyID, studyLevelID).
		First(&folder).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusNotFound), r.WithCode("NOT_FOUND"))
		}
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	var count int64
	if err := db.Model(&models.StudentScanFolder{}).
		Where("academic_year_id = ? AND faculty_id = ? AND study_level_id = ? AND name = ? AND id != ?",
			academicYearID, facultyID, studyLevelID, name, folder.ID).
		Count(&count).Error; err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	if count > 0 {
		return c.app.Api(ctx,
			r.WithError(errors.New("a folder with this name already exists")),
			r.WithStatus(fiber.StatusConflict),
			r.WithCode("CONFLICT"),
		)
	}

	folder.Name = name
	if err := db.Save(&folder).Error; err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	return c.app.Api(ctx, r.WithData(fiber.Map{
		"success": true,
		"message": "Folder updated successfully",
		"folder":  folder,
	}))
}
