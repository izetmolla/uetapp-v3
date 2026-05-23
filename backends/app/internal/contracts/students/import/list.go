package importstudents

import (
	"context"

	"github.com/flowtrove/packages/datatable"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/pkg/tablequery"
)

func (cc *Controller) GetImportStudentsListAPI(c fiber.Ctx) error {
	// db := cc.app.Postgres()
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

	students := []map[string]any{}

	// students, pagination, err := postgresql.FindRaw[map[string]any](db, q, columns, models.Student{}.TableName()).Run()
	// if err != nil {
	// 	return cc.app.Api(c,
	// 		r.WithError(err),
	// 		r.WithStatus(fiber.StatusInternalServerError),
	// 		r.WithCode("INTERNAL_SERVER_ERROR"),
	// 	)
	// }

	// datatable.FormatContent(&students, columns)

	return c.JSON(fiber.Map{
		"data":       students,
		"pagination": datatable.Pagination{},
		"q":          q,
	})
}

func (cc *Controller) GetStudentsColumns(c fiber.Ctx) error {
	columns, err := cc.getStudentsColumns(c.Context())
	if err != nil {
		return cc.app.Api(c, cc.app.Render().WithError(err))
	}
	return cc.app.Api(c, cc.app.Render().WithData(datatable.GetColumns(columns)))
}

func (cc *Controller) getStudentsColumns(ctx context.Context) ([]datatable.Column, error) {
	return []datatable.Column{
		{
			ID:          "id",
			AccessorKey: "id",
			Hidden:      true,
		},
		{
			ID:                 "full_name",
			SQLColumn:          "CONCAT(firstname, ' ', lastname)",
			AccessorKey:        "full_name",
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
			ID:          "first_name",
			AccessorKey: "first_name",
			Header:      "Emri",
			Hidden:      true,
		},
		{
			ID:          "last_name",
			AccessorKey: "last_name",
			Header:      "Mbiemri",
			Hidden:      true,
		},
		{
			ID:          "student_code",
			AccessorKey: "student_code",
			Header:      "Kodi",
			Hidden:      true,
		},
		{
			ID:          "email",
			AccessorKey: "email",
			Header:      "Email",
			Hidden:      true,
		},
		{
			ID:          "image",
			AccessorKey: "image",
			Hidden:      true,
		},
		{
			ID:          "id_number",
			AccessorKey: "id_number",
			Header:      "ID Number",
			// EnableSorting:      true,
			// EnableColumnFilter: true,
			Hidden: true,
			Meta: &datatable.ColumnMeta{
				Label:   "ID Number",
				Variant: "text",
			},
		},
		{
			ID:          "pasport_number",
			AccessorKey: "pasport_number",
			Header:      "Passport Number",
			// EnableSorting:      true,
			// EnableColumnFilter: true,
			Hidden: true,
			Meta: &datatable.ColumnMeta{
				Label:   "Passport Number",
				Variant: "text",
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
			ID:                 "study_level",
			AccessorKey:        "study_level",
			Header:             "Niveli Studimit",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Niveli Studimit",
				Variant:     "multiSelect",
				Placeholder: "Zgjidh nivelin...",
				Options:     cc.filterOptions(ctx, "study_level", ""),
			},
		},
		{
			ID:                 "faculties",
			AccessorKey:        "faculty_id",
			Header:             "Fakultetet",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Fakultetet",
				Variant:     "multiSelect",
				Placeholder: "Zgjidh fakultetin...",
				Options:     cc.filterOptions(ctx, "faculties", ""),
			},
		},
		{
			ID:                 "study_program",
			AccessorKey:        "study_program_id",
			Header:             "Programi Studimit",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Programi Studimit",
				Variant:     "multiSelect",
				Placeholder: "Zgjidh programin...",
				Options:     cc.filterOptions(ctx, "study_program", ""),
			},
		},
		{
			ID:                 "study_profile",
			AccessorKey:        "study_profile_id",
			Header:             "Profili Studimit",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Profili Studimit",
				Variant:     "multiSelect",
				Placeholder: "Zgjidh profilin...",
				Options:     cc.filterOptions(ctx, "study_profile", ""),
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
