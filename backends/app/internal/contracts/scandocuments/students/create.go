package students

import (
	"errors"
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
)

type createFolderPayload struct {
	Name string `json:"name"`
}

func (c *Controller) CreateFolder(ctx fiber.Ctx) error {
	r := c.app.Render()
	ctxPtr := ctx.Context()

	year := strings.TrimSpace(ctx.Query("year"))
	facultySlug := strings.TrimSpace(ctx.Query("faculty_slug"))
	levelSlug := strings.TrimSpace(ctx.Query("level_slug"))
	if year == "" || facultySlug == "" || levelSlug == "" {
		return c.app.Api(ctx,
			r.WithError(errors.New("year, faculty_slug, and level_slug are required")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	var payload createFolderPayload
	if err := ctx.Bind().JSON(&payload); err != nil {
		return c.app.Api(ctx,
			r.WithError(err),
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
	var count int64
	if err := db.Model(&models.StudentScanFolder{}).
		Where("academic_year_id = ? AND faculty_id = ? AND study_level_id = ? AND name = ?",
			academicYear.ID, faculty.ID, studyLevel.ID, name).
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
		AcademicYearID: academicYear.ID,
		FacultyID:      faculty.ID,
		StudyLevelID:   studyLevel.ID,
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
