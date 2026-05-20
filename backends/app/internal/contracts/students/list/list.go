package list

import (
	"context"

	"github.com/flowtrove/packages/datatable"
	"github.com/flowtrove/packages/datatable/postgresql"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/pkg/tablequery"
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

func (cc *Controller) getStudentsColumns(_ context.Context) ([]datatable.Column, error) {
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
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Email",
				Variant:     "text",
				Placeholder: "Search email...",
			},
		},
		{
			ID:                 "id_number",
			AccessorKey:        "id_number",
			Header:             "ID Number",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:   "ID Number",
				Variant: "text",
			},
		},
		{
			ID:                 "pasport_number",
			AccessorKey:        "pasport_number",
			Header:             "Passport Number",
			EnableSorting:      true,
			EnableColumnFilter: true,
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
			ID:          "created_at",
			AccessorKey: "created_at",
			Header:      "Created",
			EnableSorting: true,
			Meta: &datatable.ColumnMeta{
				Label:   "Created",
				Variant: "date",
			},
		},
	}, nil
}
