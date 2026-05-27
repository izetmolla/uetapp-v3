package documents

import (
	"context"
	"errors"
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/pkg/syncstudents"
	"gorm.io/gorm"
)

type AddStudentsRequest struct {
	FolderID int64    `json:"folder_id"`
	Students []string `json:"students"`
}

func (c *Controller) AddStudentsAPI(ctx fiber.Ctx) error {
	r := c.app.Render()
	req := AddStudentsRequest{}
	if err := ctx.Bind().JSON(&req); err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusBadRequest), r.WithCode("BAD_REQUEST"))
	}

	result, err := syncstudents.New(c.app).ImportStudents(ctx.Context(), syncstudents.ImportStudentsRequest{
		Students: req.Students,
	})
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	folder, err := gorm.G[models.StudentScanFolder](c.app.Postgres()).
		Select("id", "name", "academic_year_id", "faculty_id").
		Where("id = ?", req.FolderID).
		Preload("AcademicYear", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "year")
			return nil
		}).
		Preload("Faculty", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "name")
			return nil
		}).
		First(ctx.Context())
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	for _, student := range result.Students {
		programs, err := gorm.G[models.StudentStudyProgram](c.app.Postgres()).
			Select("id").
			Where("student_id = ? AND reg_year_id = ?", student.ID, folder.AcademicYearID).
			Find(ctx.Context())
		if err != nil {
			return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
		}
		if len(programs) == 0 {
			continue
		}
		for _, program := range programs {
			if _, err := c.createOrSkipDocumentCreation(ctx.Context(), student.ID, folder.ID, program.ID); err != nil {
				return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
			}
		}
	}

	return c.app.Api(ctx, r.WithData(result), r.WithStatus(fiber.StatusOK), r.WithCode("OK"))
}

func (cc *Controller) createOrSkipDocumentCreation(ctx context.Context, studentID, folderID, studentStudyProgramID int64) (models.StudentScanFolderDoc, error) {
	if studentID <= 0 || folderID <= 0 || studentStudyProgramID <= 0 {
		return models.StudentScanFolderDoc{}, errors.New("student_id, folder_id and student_study_program_id are required")
	}

	db := cc.app.Postgres().WithContext(ctx)
	lookup := func(dest *models.StudentScanFolderDoc) error {
		return db.Where(
			"student_id = ? AND student_scan_folder_id = ? AND student_study_program_id = ?",
			studentID, folderID, studentStudyProgramID,
		).First(dest).Error
	}

	var doc models.StudentScanFolderDoc
	err := lookup(&doc)
	if err == nil {
		return doc, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return models.StudentScanFolderDoc{}, err
	}

	doc = models.StudentScanFolderDoc{
		StudentID:             studentID,
		StudentScanFolderID:   folderID,
		StudentStudyProgramID: &studentStudyProgramID,
	}
	if err := db.Create(&doc).Error; err != nil {
		if isUniqueConstraintError(err) {
			if err := lookup(&doc); err != nil {
				return models.StudentScanFolderDoc{}, err
			}
			return doc, nil
		}
		return models.StudentScanFolderDoc{}, err
	}
	return doc, nil
}

func isUniqueConstraintError(err error) bool {
	if err == nil {
		return false
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "duplicate") ||
		strings.Contains(msg, "unique constraint") ||
		strings.Contains(msg, "unique index") ||
		strings.Contains(msg, "23505")
}
