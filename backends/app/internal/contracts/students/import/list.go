package importstudents

import (
	"context"
	"fmt"
	"strings"

	"github.com/flowtrove/packages/datatable"
	"github.com/flowtrove/packages/drivers/httprequest"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/pkg/tablequery"
	"gorm.io/gorm"
)

func (cc *Controller) GetImportStudentsListAPI(c fiber.Ctx) error {
	ctxReq := c.Context()
	db := cc.app.Postgres()
	r := cc.app.Render()
	// columns, err := cc.getStudentsColumns(ctxReq, tablequery.GetFilter(c, "study_level"))
	// if err != nil {
	// 	return cc.app.Api(c,
	// 		r.WithError(err),
	// 		r.WithStatus(fiber.StatusInternalServerError),
	// 		r.WithCode("INTERNAL_SERVER_ERROR"),
	// 	)
	// }

	// q, err := tablequery.Extract(c, columns)
	// if err != nil {
	// 	return cc.app.Api(c,
	// 		r.WithError(err),
	// 		r.WithStatus(fiber.StatusBadRequest),
	// 		r.WithCode("BAD_REQUEST"),
	// 	)
	// }

	studyIds := cc.getStudyProgramOldIds(c.Context(), tablequery.GetFilter(c, "study_level"), tablequery.GetFilter(c, "study_program"))

	fmt.Println("Study IDs: ", studyIds)
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

	resource, err := gorm.G[models.Resource](db).
		Select("id", "config").
		Where("id = ?", 3).
		First(ctxReq)
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	req, err := httprequest.FromConfigContext(ctxReq, resource.Config)
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	if token, ok := resource.Config["authorization"].(string); ok && strings.TrimSpace(token) != "" {
		if req.Headers == nil {
			req.Headers = map[string]string{}
		}
		req.Headers["Authorization"] = "Bearer " + strings.TrimSpace(token)
	}
	if req.Headers == nil {
		req.Headers = map[string]string{}
	}
	if req.Headers["Content-Type"] == "" {
		req.Headers["Content-Type"] = "application/json"
	}

	if req.Params == nil {
		req.Params = map[string]string{}
	}
	req.Params["action"] = "getUsers"
	if kw := strings.TrimSpace(tablequery.GetFilterValue(c, "full_name")); kw != "" {
		req.Params["keyword"] = kw
	}
	// req.Params["page"] = c.Query("pagination[page]", "1")
	// req.Params["pageSize"] = c.Query("pagination[pageSize]", "10")

	res, err := httprequest.Execute[map[string]any](req)
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	return c.JSON(fiber.Map{
		"data":       students,
		"pagination": datatable.Pagination{},
		"res":        res,
	})
}

func (cc *Controller) GetStudentsColumns(c fiber.Ctx) error {
	columns, err := cc.getStudentsColumns(c.Context(), []string{})
	if err != nil {
		return cc.app.Api(c, cc.app.Render().WithError(err))
	}
	return cc.app.Api(c, cc.app.Render().WithData(datatable.GetColumns(columns)))
}

func (cc *Controller) getStudentsColumns(ctx context.Context, studyLevelIds []string) ([]datatable.Column, error) {
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
				Options:     cc.filterOptions(ctx, "study_level", nil),
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
				FilterBy:    "study_level",
				Options:     cc.filterOptions(ctx, "faculties", studyLevelIds),
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
				Options:     cc.filterOptions(ctx, "study_program", nil),
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
				Options:     cc.filterOptions(ctx, "study_profile", nil),
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
