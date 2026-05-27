package documents

import (
	"context"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (c *Controller) GetListDataApi(ctx fiber.Ctx) error {
	ctxPtr := ctx.Context()
	r := c.app.Render()

	folder, err := c.getFolder(ctxPtr, ctx.Query("folder_id"))
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	documents, err := c.getDocuments(ctxPtr, folder.ID)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	return c.app.Api(ctx, r.WithData(fiber.Map{
		"documents": documents,
		"faculty": map[string]any{
			"id":   folder.FacultyID,
			"name": folder.Faculty.Name,
			"slug": folder.Faculty.Slug,
		},
		"academic_year": map[string]any{
			"id":   folder.AcademicYearID,
			"year": folder.AcademicYear.Year,
		},
		"study_level_group": map[string]any{
			"id":   folder.StudyLevelGroupID,
			"name": folder.StudyLevelGroup.Name,
		},
		"folder": map[string]any{
			"id":   folder.ID,
			"name": folder.Name,
		},
	}))
}
func (c *Controller) GetListDataView(ctx fiber.Ctx) error {
	ctxPtr := ctx.Context()
	r := c.app.Render()
	folder, err := c.getFolder(ctxPtr, ctx.Params("folder_id"))
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	documents, err := c.getDocuments(ctxPtr, folder.ID)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	return c.app.View(ctx, r.WithData(fiber.Map{
		"documents": documents,
		"faculty": map[string]any{
			"id":   folder.FacultyID,
			"name": folder.Faculty.Name,
			"slug": folder.Faculty.Slug,
		},
		"academic_year": map[string]any{
			"id":   folder.AcademicYearID,
			"year": folder.AcademicYear.Year,
		},
		"study_level_group": map[string]any{
			"id":   folder.StudyLevelGroupID,
			"name": folder.StudyLevelGroup.Name,
		},
		"folder": map[string]any{
			"id":   folder.ID,
			"name": folder.Name,
		},
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
		Preload("StudentScanLevelGroupLevels", func(pb gorm.PreloadBuilder) error {
			pb.Select("student_scan_level_group_id", "study_level_id")
			return nil
		}).
		Preload("StudentScanLevelGroupLevels.StudyLevel", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "name")
			return nil
		}).
		First(ctx)
	if err != nil {
		return nil, err
	}
	return &studyLevelGroup, nil
}

func (c *Controller) getFolder(ctx context.Context, folderID string) (*models.StudentScanFolder, error) {
	db := c.app.Postgres()
	folder, err := gorm.G[models.StudentScanFolder](db).
		Where("id = ?", folderID).
		Preload("Faculty", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "name", "slug")
			return nil
		}).
		Preload("AcademicYear", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "year")
			return nil
		}).
		Preload("StudyLevelGroup", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "name")
			return nil
		}).
		First(ctx)
	if err != nil {
		return nil, err
	}
	return &folder, nil
}
func (c *Controller) getDocuments(ctx context.Context, folderID int64) ([]map[string]any, error) {
	res := make([]map[string]any, 0)
	db := c.app.Postgres()
	docs, err := gorm.G[models.StudentScanFolderDoc](db).
		Where(&models.StudentScanFolderDoc{
			StudentScanFolderID: folderID,
		}).
		Preload("Student", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "firstname", "lastname", "email", "document_id")
			return nil
		}).
		Find(ctx)
	if err != nil {
		return nil, err
	}
	for _, doc := range docs {
		res = append(res, map[string]any{
			"id":   doc.ID,
			"name": doc.Student.Firstname + " " + doc.Student.Lastname,
		})
	}
	return res, nil
}
