package faculties

import (
	"github.com/flowtrove/packages/datatable"
	"github.com/flowtrove/packages/datatable/postgresql"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/modules/cadmin/orgunits/helpers"
	"github.com/uetedu/app/pkg/tablequery"
)

func (cc *Controller) GetFacultiesListAPI(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()
	columns, err := cc.getFacultiesColumns()
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

	rows, pagination, err := postgresql.FindRaw[map[string]any](db, q, columns, models.Faculty{}.TableName()).Run()
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	datatable.FormatContent(&rows, columns)

	return c.JSON(fiber.Map{
		"data":       rows,
		"pagination": datatable.RenderPagination(pagination),
	})
}

func (cc *Controller) GetFacultiesListView(c fiber.Ctx) error {
	ctxPtr := c.Context()
	db := cc.app.Postgres()
	r := cc.app.Render()
	columns, err := cc.getFacultiesColumns()
	if err != nil {
		return cc.app.View(c, r.WithContext(ctxPtr), r.WithTitle("Faculties"), r.WithError(err))
	}

	q, err := tablequery.Extract(c, columns)
	if err != nil {
		return cc.app.View(c, r.WithContext(ctxPtr), r.WithTitle("Faculties"), r.WithError(err))
	}

	rows, pagination, err := postgresql.FindRaw[map[string]any](db, q, columns, models.Faculty{}.TableName()).Run()
	if err != nil {
		return cc.app.View(c, r.WithContext(ctxPtr), r.WithTitle("Faculties"), r.WithError(err))
	}

	datatable.FormatContent(&rows, columns)
	return cc.app.View(c, r.WithContext(ctxPtr), r.WithTitle("Faculties"), r.WithData(fiber.Map{
		"data":       rows,
		"pagination": datatable.RenderPagination(pagination),
		"query":      q,
	}))
}

func (cc *Controller) GetFacultiesColumns(c fiber.Ctx) error {
	columns, err := cc.getFacultiesColumns()
	if err != nil {
		return cc.app.Api(c, cc.app.Render().WithError(err))
	}
	return cc.app.Api(c, cc.app.Render().WithData(datatable.GetColumns(columns)))
}

func (cc *Controller) getFacultiesColumns() ([]datatable.Column, error) {
	return []datatable.Column{
		{ID: "id", AccessorKey: "id", Hidden: true},
		{
			ID:                 "name",
			AccessorKey:        "name",
			Header:             "Name",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Name",
				Variant:     "text",
				Placeholder: "Search name...",
			},
		},
		{
			ID:                 "slug",
			AccessorKey:        "slug",
			Header:             "Slug",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Hidden:             true,
		},
		{
			ID:                 "description",
			AccessorKey:        "description",
			Header:             "Description",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Hidden:             true,
		},
		{
			ID:                 "image",
			AccessorKey:        "image",
			Header:             "Image",
			EnableSorting:      false,
			EnableColumnFilter: false,
			Hidden:             true,
		},
		{
			ID:                 "status",
			AccessorKey:        "status",
			Header:             "Status",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta:               helpers.ActiveInactiveStatusMeta(),
		},
		{
			ID:                 "created_at",
			AccessorKey:        "created_at",
			Header:             "Created At",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Hidden:             true,
		},
	}, nil
}
