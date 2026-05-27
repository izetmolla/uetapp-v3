package documents

import (
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
)

func (c *Controller) SearchStudents(ctx fiber.Ctx) error {
	r := c.app.Render()
	query := strings.TrimSpace(ctx.Query("query"))
	year := strings.TrimSpace(ctx.Query("year"))
	facultySlug := strings.TrimSpace(ctx.Query("faculty_slug"))
	levelSlug := strings.TrimSpace(ctx.Query("level_slug"))

	hasFilters := year != "" || facultySlug != "" || levelSlug != ""
	if query == "" && !hasFilters {
		return c.app.Api(ctx, r.WithData([]fiber.Map{}))
	}

	db := c.app.Postgres().WithContext(ctx.Context()).Model(&models.Student{}).
		Where("(students.status = 'active' OR students.status = '' OR students.status IS NULL)")

	if hasFilters {
		db = db.
			Joins("INNER JOIN student_scan_folder_docs ON student_scan_folder_docs.student_id = students.id AND student_scan_folder_docs.deleted_at IS NULL").
			Joins("INNER JOIN student_scan_folders ON student_scan_folders.id = student_scan_folder_docs.student_scan_folder_id AND student_scan_folders.deleted_at IS NULL")
		if year != "" {
			db = db.Joins("INNER JOIN academic_years ON academic_years.id = student_scan_folders.academic_year_id AND academic_years.year = ?", year)
		}
		if facultySlug != "" {
			db = db.Joins("INNER JOIN faculties ON faculties.id = student_scan_folders.faculty_id AND faculties.slug = ?", facultySlug)
		}
		if levelSlug != "" {
			db = db.Joins("INNER JOIN study_levels ON study_levels.id = student_scan_folders.study_level_id AND study_levels.slug = ?", levelSlug)
		}
		db = db.Distinct("students.id")
	}

	if query != "" {
		pattern := "%" + strings.ToLower(query) + "%"
		db = db.Where(
			"(LOWER(students.firstname) LIKE ? OR LOWER(students.lastname) LIKE ? OR "+
				"LOWER(CONCAT(students.firstname, ' ', students.lastname)) LIKE ? OR "+
				"LOWER(students.email) LIKE ? OR LOWER(students.document_id) LIKE ?)",
			pattern, pattern, pattern, pattern, pattern,
		)
	}

	var rows []models.Student
	err := db.
		Order("students.lastname ASC, students.firstname ASC").
		Limit(25).
		Find(&rows).Error
	if err != nil {
		return c.app.Api(ctx,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	results := make([]fiber.Map, 0, len(rows))
	for _, s := range rows {
		name := strings.TrimSpace(s.Firstname + " " + s.Lastname)
		if name == "" {
			name = s.Email
		}
		results = append(results, fiber.Map{
			"id":   s.ID,
			"name": name,
		})
	}

	return c.app.Api(ctx, r.WithData(results))
}
