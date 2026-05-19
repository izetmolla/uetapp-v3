package roles

import (
	"context"

	"github.com/flowtrove/packages/datatable"
	"github.com/flowtrove/packages/datatable/postgresql"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/pkg/tablequery"
)

func (cc *Controller) GetRolesListAPI(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()
	columns, err := cc.getRolesColumns(c.Context())
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

	roles, pagination, err := postgresql.FindRaw[map[string]any](db, q, columns, models.Role{}.TableName()).Run()
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	datatable.FormatContent(&roles, columns)

	return c.JSON(fiber.Map{
		"data":       roles,
		"pagination": datatable.RenderPagination(pagination),
	})
}

func (cc *Controller) GetRolesListView(c fiber.Ctx) error {
	ctxPtr := c.Context()
	db := cc.app.Postgres()
	r := cc.app.Render()
	columns, err := cc.getRolesColumns(c.Context())
	if err != nil {
		return cc.app.View(c,
			r.WithContext(ctxPtr),
			r.WithTitle("Roles List"),
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	q, err := tablequery.Extract(c, columns)
	if err != nil {
		return cc.app.View(c,
			r.WithContext(ctxPtr),
			r.WithTitle("Roles List"),
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	roles, pagination, err := postgresql.FindRaw[map[string]any](db, q, columns, models.Role{}.TableName()).Run()
	if err != nil {
		return cc.app.View(c,
			r.WithContext(ctxPtr),
			r.WithTitle("Roles List"),
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	datatable.FormatContent(&roles, columns)
	return cc.app.View(c,
		r.WithContext(ctxPtr),
		r.WithTitle("Roles List"),
		r.WithData(fiber.Map{
			"data":       roles,
			"pagination": datatable.RenderPagination(pagination),
		}))
}

func (cc *Controller) GetRolesColumns(c fiber.Ctx) error {
	columns, err := cc.getRolesColumns(c.Context())
	if err != nil {
		return cc.app.Api(c, cc.app.Render().WithError(err))
	}
	return cc.app.Api(c, cc.app.Render().WithData(datatable.GetColumns(columns)))
}

func (cc *Controller) getRolesColumns(_ context.Context) ([]datatable.Column, error) {
	return []datatable.Column{
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
				Placeholder: "Search role name...",
			},
		},
		{
			ID:                 "description",
			AccessorKey:        "description",
			Header:             "Description",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Description",
				Variant:     "text",
				Placeholder: "Search description...",
			},
		},
		{
			ID:                 "status",
			AccessorKey:        "status",
			Header:             "Status",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Status",
				Variant:     "multiSelect",
				Placeholder: "Filter status...",
				Options: []datatable.OptionItem{
					{Label: "Active", Value: "active"},
					{Label: "Disabled", Value: "inactive"},
					{Label: "Deleted", Value: "deleted"},
				},
			},
		},
		{
			ID:          "users_count",
			AccessorKey: "users_count",
			SQLColumn: `(SELECT COUNT(*)::bigint FROM users u WHERE u.deleted_at IS NULL AND u.roles @> jsonb_build_array(roles.name))`,
			Header:      "Users",
			EnableSorting: true,
			Meta: &datatable.ColumnMeta{
				Label:   "Assigned users",
				Variant: "number",
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
		{
			ID:          "updated_at",
			AccessorKey: "updated_at",
			Header:      "Updated",
			Hidden:      true,
			EnableSorting: true,
			Meta: &datatable.ColumnMeta{
				Label:   "Updated",
				Variant: "date",
			},
		},
	}, nil
}
