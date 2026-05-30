package list

import (
	"context"
	"fmt"
	"strconv"

	"github.com/flowtrove/packages/datatable"
	"github.com/flowtrove/packages/datatable/postgresql"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/pkg/tablequery"
	"gorm.io/gorm"
)

// sqlLatestEnrollmentScalar returns a correlated subquery for the latest student_study_programs row.
func sqlLatestEnrollmentScalar(selectExpr, joins string) string {
	return `(SELECT ` + selectExpr + `
	FROM student_study_programs ssp` + joins + `
	WHERE ssp.student_id = students.id AND ssp.deleted_at IS NULL
	ORDER BY ssp.created_at DESC, ssp.id DESC
	LIMIT 1)`
}

var (
	sqlLatestStudentProgramName = sqlLatestEnrollmentScalar(
		"sp.name",
		`
	INNER JOIN study_programs sp ON sp.id = ssp.study_program_id AND sp.deleted_at IS NULL`,
	)
	sqlLatestStudentFacultyName = sqlLatestEnrollmentScalar(
		"f.name",
		`
	INNER JOIN faculties f ON f.id = ssp.faculty_id AND f.deleted_at IS NULL`,
	)
	sqlLatestStudentStudyLevelName = sqlLatestEnrollmentScalar(
		"sl.name",
		`
	INNER JOIN study_levels sl ON sl.id = ssp.study_level_id AND sl.deleted_at IS NULL`,
	)
	sqlLatestStudentStudyLevelID = sqlLatestEnrollmentScalar(
		"ssp.study_level_id",
		"",
	)
	// Start year only (e.g. "2020" from "2020-2021") for list UI formatting.
	sqlLatestStudentRegYear = sqlLatestEnrollmentScalar(
		"SPLIT_PART(ay.year, '-', 1)",
		`
	INNER JOIN academic_years ay ON ay.id = ssp.reg_year_id AND ay.deleted_at IS NULL`,
	)
)

func (cc *Controller) GetStudentsListAPI(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()
	columns, err := cc.getStudentsColumns(c.Context())
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	q, err := tablequery.Extract(c, columns)
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	students, pagination, err := postgresql.FindRaw[map[string]any](db, q, columns, models.Student{}.TableName()).Run()
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	datatable.FormatContent(&students, columns)

	return c.JSON(fiber.Map{
		"data":       students,
		"pagination": datatable.RenderPagination(pagination),
	})
}

func (cc *Controller) GetStudentsListView(c fiber.Ctx) error {
	ctxPtr := c.Context()
	db := cc.app.Postgres()
	r := cc.app.Render()
	columns, err := cc.getStudentsColumns(c.Context())
	if err != nil {
		return cc.app.View(c,
			r.WithContext(ctxPtr),
			r.WithTitle("Students List"),
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	q, err := tablequery.Extract(c, columns)
	if err != nil {
		return cc.app.View(c,
			r.WithContext(ctxPtr),
			r.WithTitle("Students List"),
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	students, pagination, err := postgresql.FindRaw[map[string]any](db, q, columns, models.Student{}.TableName()).Run()
	if err != nil {
		return cc.app.View(c,
			r.WithContext(ctxPtr),
			r.WithTitle("Students List"),
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	datatable.FormatContent(&students, columns)
	return cc.app.View(c,
		r.WithContext(ctxPtr),
		r.WithTitle("Students List"),
		r.WithData(fiber.Map{
			"data":       students,
			"pagination": datatable.RenderPagination(pagination),
		}))
}

func (cc *Controller) GetStudentsColumns(c fiber.Ctx) error {
	columns, err := cc.getStudentsColumns(c.Context())
	if err != nil {
		return cc.app.Api(c, cc.app.Render().WithError(err))
	}
	return cc.app.Api(c, cc.app.Render().WithData(datatable.GetColumns(columns)))
}

func (cc *Controller) getStudentsColumns(ctx context.Context) ([]datatable.Column, error) {
	studyLevelOptions, err := cc.getStudyLevelOptions(ctx)
	if err != nil {
		return nil, err
	}
	return []datatable.Column{
		{
			ID:          "id",
			AccessorKey: "id",
			Hidden:      true,
		},
		{
			ID:                 "fullname",
			SQLColumn:          "CONCAT(firstname, ' ', lastname)",
			AccessorKey:        "fullname",
			Header:             "Full Name",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Full Name",
				Variant:     "text",
				Placeholder: "Search name...",
			},
		},
		{
			ID:                 "document_id",
			AccessorKey:        "document_id",
			Header:             "ID Number",
			EnableSorting:      true,
			EnableColumnFilter: false,
		},

		{
			ID:                 "year",
			AccessorKey:        "year",
			Header:             "Year",
			SQLColumn:          sqlLatestStudentRegYear,
			EnableSorting:      true,
			EnableColumnFilter: false,
		},
		{
			ID:                 "program",
			AccessorKey:        "program",
			SQLColumn:          sqlLatestStudentProgramName,
			Header:             "Program",
			EnableSorting:      true,
			EnableColumnFilter: false,
		},
		{
			ID:                 "faculty",
			AccessorKey:        "faculty",
			SQLColumn:          sqlLatestStudentFacultyName,
			Header:             "Faculty",
			EnableSorting:      true,
			EnableColumnFilter: false,
			Hidden:             true,
		},
		{
			ID:                 "study_level",
			AccessorKey:        "study_level",
			SQLColumn:          sqlLatestStudentStudyLevelName,
			FilterSQLColumn:    sqlLatestStudentStudyLevelID,
			Header:             "Study Level",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:   "Study Level",
				Variant: "multiSelect",
				Options: studyLevelOptions,
			},
		},
		{
			ID:                 "year",
			AccessorKey:        "year",
			SQLColumn:          sqlLatestStudentRegYear,
			Header:             "Reg. Year",
			EnableSorting:      true,
			EnableColumnFilter: false,
			Hidden:             true,
		},

		{
			ID:                        "firstname",
			AccessorKey:               "firstname",
			Header:                    "First Name",
			Hidden:                    true,
			EnableOnlyAdvancedFilters: true,
			Meta: &datatable.ColumnMeta{
				Label:   "First Name",
				Variant: "text",
			},
		},
		{
			ID:                        "lastname",
			AccessorKey:               "lastname",
			Header:                    "Last Name",
			Hidden:                    true,
			EnableOnlyAdvancedFilters: true,
			Meta: &datatable.ColumnMeta{
				Label:   "Last Name",
				Variant: "text",
			},
		},
		{
			ID:                 "email",
			AccessorKey:        "email",
			Header:             "Email",
			EnableSorting:      true,
			EnableColumnFilter: false,
			Meta: &datatable.ColumnMeta{
				Label:       "Email",
				Variant:     "text",
				Placeholder: "Search email...",
			},
		},
		{
			ID:                 "status",
			AccessorKey:        "status",
			Header:             "Status",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:   "Status",
				Variant: "multiSelect",
				Options: []datatable.OptionItem{
					{Label: "Active", Value: "active"},
					{Label: "Inactive", Value: "inactive"},
				},
			},
		},
		{
			ID:            "created_at",
			AccessorKey:   "created_at",
			Header:        "Created",
			EnableSorting: true,
			Meta: &datatable.ColumnMeta{
				Label:   "Created",
				Variant: "date",
			},
		},
	}, nil
}

func (cc *Controller) getStudyLevelOptions(ctx context.Context) ([]datatable.OptionItem, error) {
	studyLevels := []datatable.OptionItem{}
	studyLevelsDb, err := gorm.G[models.StudyLevel](cc.app.Postgres()).Find(ctx)
	if err != nil {
		fmt.Println("Error getting study levels: ", err)
	} else {
		for _, studyLevel := range studyLevelsDb {
			studyLevels = append(studyLevels, datatable.OptionItem{
				Label: studyLevel.Name,
				Value: strconv.FormatInt(studyLevel.ID, 10),
			})
		}
	}
	return studyLevels, nil
}
