package folders

import (
	"bytes"
	"encoding/csv"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (c *Controller) DownloadFolder(ctx fiber.Ctx) error {
	r := c.app.Render()
	ctxPtr := ctx.Context()

	folderID, err := strconv.ParseInt(ctx.Params("id"), 10, 64)
	if err != nil || folderID <= 0 {
		return c.app.Api(ctx,
			r.WithError(errors.New("invalid folder id")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	year := strings.TrimSpace(ctx.Query("year"))
	facultySlug := strings.TrimSpace(ctx.Query("faculty_slug"))
	groupID := strings.TrimSpace(ctx.Query("group_id"))
	if year == "" || facultySlug == "" || groupID == "" {
		return c.app.Api(ctx,
			r.WithError(errors.New("year, faculty_slug, and group_id are required")),
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
	var folder models.StudentScanFolder
	if err := db.WithContext(ctxPtr).
		Where(&models.StudentScanFolder{
			ID:                folderID,
			AcademicYearID:    academicYear.ID,
			FacultyID:         faculty.ID,
			StudyLevelGroupID: studyLevelGroup.ID,
		}).
		First(&folder).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusNotFound), r.WithCode("NOT_FOUND"))
		}
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	var docs []models.StudentScanFolderDoc
	if err := db.WithContext(ctxPtr).
		Where("student_scan_folder_id = ?", folder.ID).
		Preload("Student", func(tx *gorm.DB) *gorm.DB {
			return tx.Select("id", "firstname", "lastname", "email", "id_number", "pasport_number")
		}).
		Find(&docs).Error; err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	var buf bytes.Buffer
	w := csv.NewWriter(&buf)
	_ = w.Write([]string{
		"document_name",
		"completed",
		"student_firstname",
		"student_lastname",
		"student_email",
		"student_id_number",
		"student_passport_number",
	})
	for _, doc := range docs {
		completed := "no"
		if doc.Completed {
			completed = "yes"
		}
		_ = w.Write([]string{
			doc.Name,
			completed,
			doc.Student.Firstname,
			doc.Student.Lastname,
			doc.Student.Email,
			doc.Student.IdNumber,
			doc.Student.PasportNumber,
		})
	}
	w.Flush()
	if err := w.Error(); err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	safeName := strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			return r
		}
		return '_'
	}, folder.Name)
	filename := fmt.Sprintf("%s-scan-folder.csv", safeName)

	ctx.Set("Content-Type", "text/csv; charset=utf-8")
	ctx.Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	return ctx.Send(buf.Bytes())
}
