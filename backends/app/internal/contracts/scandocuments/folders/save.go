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
	GroupID     string `json:"group_id"`
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
	groupID := strings.TrimSpace(payload.GroupID)
	if year == "" || facultySlug == "" || groupID == "" {
		return c.app.Api(ctx,
			r.WithError(errors.New("year, faculty_slug, and group_id are required")),
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
	studyLevelGroup, err := c.getStudyLevelGroup(ctxPtr, groupID)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusNotFound), r.WithCode("NOT_FOUND"))
	}

	db := c.app.Postgres()
	folderID, _ := strconv.ParseInt(strings.TrimSpace(payload.ID), 10, 64)

	if folderID > 0 {
		return c.updateFolder(ctx, db.WithContext(ctxPtr), folderID, name, academicYear.ID, faculty.ID, studyLevelGroup.ID)
	}

	return c.createFolderRecord(ctx, db.WithContext(ctxPtr), name, academicYear.ID, faculty.ID, studyLevelGroup.ID)
}

func (c *Controller) createFolderRecord(
	ctx fiber.Ctx,
	db *gorm.DB,
	name string,
	academicYearID, facultyID,
	studyLevelGroupID int64,
) error {
	r := c.app.Render()

	var count int64
	if err := db.Model(&models.StudentScanFolder{}).
		Where(&models.StudentScanFolder{
			AcademicYearID:    academicYearID,
			FacultyID:         facultyID,
			StudyLevelGroupID: studyLevelGroupID,
			Name:              name,
		}).
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
		Name:              name,
		AcademicYearID:    academicYearID,
		FacultyID:         facultyID,
		StudyLevelGroupID: studyLevelGroupID,
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
	academicYearID, facultyID, studyLevelGroupID int64,
) error {
	r := c.app.Render()

	var folder models.StudentScanFolder
	if err := db.
		Where(&models.StudentScanFolder{
			ID:                folderID,
			AcademicYearID:    academicYearID,
			FacultyID:         facultyID,
			StudyLevelGroupID: studyLevelGroupID,
		}).
		First(&folder).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusNotFound), r.WithCode("NOT_FOUND"))
		}
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	var count int64
	if err := db.Model(&models.StudentScanFolder{}).
		Where(&models.StudentScanFolder{
			AcademicYearID:    academicYearID,
			FacultyID:         facultyID,
			StudyLevelGroupID: studyLevelGroupID,
			Name:              name,
		}).
		Where("id != ?", folder.ID).
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
