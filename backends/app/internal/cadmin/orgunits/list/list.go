package list

import (
	"github.com/flowtrove/packages/datatable"
	"github.com/flowtrove/packages/datatable/postgresql"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/pkg/tablequery"
)

func (cc *Controller) GetOrgUnitsListAPI(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()
	columns, err := cc.getOrgUnitsColumns()
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

	orgUnits, pagination, err := postgresql.FindRaw[map[string]any](db, q, columns, models.OrgUnit{}.TableName()).Run()
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	datatable.FormatContent(&orgUnits, columns)

	return c.JSON(fiber.Map{
		"data":       orgUnits,
		"pagination": datatable.RenderPagination(pagination),
	})
}

func (cc *Controller) GetOrgUnitsListView(c fiber.Ctx) error {
	ctxPtr := c.Context()
	db := cc.app.Postgres()
	r := cc.app.Render()
	columns, err := cc.getOrgUnitsColumns()
	if err != nil {
		return cc.app.View(c, r.WithContext(ctxPtr), r.WithTitle("Org Units List"), r.WithError(err))
	}

	q, err := tablequery.Extract(c, columns)
	if err != nil {
		return cc.app.View(c, r.WithContext(ctxPtr), r.WithTitle("Org Units List"), r.WithError(err))
	}

	orgUnits, pagination, err := postgresql.FindRaw[map[string]any](db, q, columns, models.OrgUnit{}.TableName()).Run()
	if err != nil {
		return cc.app.View(c, r.WithContext(ctxPtr), r.WithTitle("Org Units List"), r.WithError(err))
	}

	datatable.FormatContent(&orgUnits, columns)
	return cc.app.View(c, r.WithContext(ctxPtr), r.WithTitle("Org Units List"), r.WithData(fiber.Map{
		"data":       orgUnits,
		"pagination": datatable.RenderPagination(pagination),
		"query":      q,
	}))
}

func (cc *Controller) GetOrgUnitsColumns(c fiber.Ctx) error {
	columns, err := cc.getOrgUnitsColumns()
	if err != nil {
		return cc.app.Api(c, cc.app.Render().WithError(err))
	}

	return cc.app.Api(c, cc.app.Render().WithData(datatable.GetColumns(columns)))
}

func (cc *Controller) getOrgUnitsColumns() ([]datatable.Column, error) {
	var columns = []datatable.Column{
		{
			ID:          "id",
			AccessorKey: "id",
			Hidden:      true,
		},
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
			ID:                 "unit",
			AccessorKey:        "unit",
			Header:             "Unit",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Hidden:             true,
		},
		{
			ID:                 "is_default",
			AccessorKey:        "is_default",
			Header:             "Is Default",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Hidden:             true,
		},
		{
			ID:                 "created_at",
			AccessorKey:        "created_at",
			Header:             "Created At",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Hidden:             true,
		},
	}

	return columns, nil
}
