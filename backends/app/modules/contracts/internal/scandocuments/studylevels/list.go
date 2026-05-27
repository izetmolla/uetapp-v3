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
	academicYear, err := c.getAcademicYear(ctxPtr, ctx.Query("year"))
	if err != nil {
		return c.app.Api(ctx,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}
	study_levels, err := c.getStudyLevels(ctxPtr)
	if err != nil {
		return c.app.Api(ctx,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}
	faculty, err := c.getFacultyBySlug(ctxPtr, ctx.Query("faculty_slug"))
	if err != nil {
		return c.app.Api(ctx,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	study_level_groups, err := c.getStudentScanLevelGroups(ctxPtr, faculty.ID, academicYear.ID)
	if err != nil {
		return c.app.Api(ctx,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}
	return c.app.Api(ctx, r.WithData(fiber.Map{
		"study_levels":       study_levels,
		"faculty":            &faculty,
		"academic_year":      &academicYear,
		"study_level_groups": study_level_groups,
	}))
}
func (c *Controller) GetListDataView(ctx fiber.Ctx) error {
	ctxPtr := ctx.Context()
	r := c.app.Render()
	study_levels, err := c.getStudyLevels(ctxPtr)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	faculty, err := c.getFacultyBySlug(ctxPtr, ctx.Params("faculty_slug"))
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	academicYear, err := c.getAcademicYear(ctxPtr, ctx.Params("year"))
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	study_level_groups, err := c.getStudentScanLevelGroups(ctxPtr, faculty.ID, academicYear.ID)
	if err != nil {
		return c.app.View(ctx, r.WithError(err))
	}
	return c.app.View(ctx, r.WithData(fiber.Map{
		"study_levels":       study_levels,
		"faculty":            &faculty,
		"study_level_groups": study_level_groups,
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
			"students":    0,
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

func (c *Controller) getAcademicYear(ctx context.Context, year string) (*models.AcademicYear, error) {
	db := c.app.Postgres()
	academicYear, err := gorm.G[models.AcademicYear](db).
		Select("id", "year").
		Where("year = ?", year).
		First(ctx)
	if err != nil {
		return nil, err
	}
	return &academicYear, nil
}
func (c *Controller) getStudentScanLevelGroups(ctx context.Context, facultyID, academicYearID int64) ([]map[string]any, error) {
	res := make([]map[string]any, 0)
	db := c.app.Postgres()
	studentScanLevelGroups, err := gorm.G[models.StudentScanLevelGroup](db).
		Where(&models.StudentScanLevelGroup{
			FacultyID:      facultyID,
			AcademicYearID: academicYearID,
		}).
		Preload("StudentScanLevelGroupLevels", func(pb gorm.PreloadBuilder) error {
			pb.Select("student_scan_level_group_id", "study_level_id")
			return nil
		}).
		Preload("StudentScanLevelGroupLevels.StudyLevel", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "name", "slug", "description", "duration", "group", "icon", "accent")
			return nil
		}).
		Find(ctx)
	if err != nil {
		return nil, err
	}
	for _, studentScanLevelGroup := range studentScanLevelGroups {
		levels := make([]map[string]any, 0, len(studentScanLevelGroup.StudentScanLevelGroupLevels))
		for _, link := range studentScanLevelGroup.StudentScanLevelGroupLevels {
			sl := link.StudyLevel
			levels = append(levels, map[string]any{
				"id":          int(sl.ID),
				"slug":        sl.Slug,
				"name":        sl.Name,
				"description": sl.Description,
				"duration":    sl.Duration,
				"students":    0,
				"group":       sl.Group,
				"icon":        sl.Icon,
				"accent":      sl.Accent,
			})
		}
		res = append(res, map[string]any{
			"id":           int(studentScanLevelGroup.ID),
			"name":         studentScanLevelGroup.Name,
			"study_levels": levels,
		})
	}
	return res, nil
}
