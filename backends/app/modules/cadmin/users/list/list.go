package list

import (
	"context"
	"fmt"

	"github.com/flowtrove/packages/datatable"
	"github.com/flowtrove/packages/datatable/postgresql"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/pkg/tablequery"
)

func (cc *Controller) GetUsersListAPI(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()
	columns, err := cc.getUsersColumns(c.Context())
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

	users, pagination, err := postgresql.FindRaw[map[string]any](db, q, columns, models.User{}.TableName()).Run()
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	datatable.FormatContent(&users, columns)

	return c.JSON(fiber.Map{
		"data":       users,
		"pagination": datatable.RenderPagination(pagination),
	})
}

func (cc *Controller) GetUsersListView(c fiber.Ctx) error {
	ctxPtr := c.Context()
	db := cc.app.Postgres()
	r := cc.app.Render()
	columns, err := cc.getUsersColumns(c.Context())
	if err != nil {
		return cc.app.View(c,
			r.WithContext(ctxPtr),
			r.WithTitle("Users List"),
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	q, err := tablequery.Extract(c, columns)
	if err != nil {
		return cc.app.View(c,
			r.WithContext(ctxPtr),
			r.WithTitle("Users List"),
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	fmt.Println("q", q)

	users, pagination, err := postgresql.FindRaw[map[string]any](db, q, columns, models.User{}.TableName()).Run()
	if err != nil {
		return cc.app.View(c,
			r.WithContext(ctxPtr),
			r.WithTitle("Users List"),
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	datatable.FormatContent(&users, columns)
	return cc.app.View(c,
		r.WithContext(ctxPtr),
		r.WithTitle("Users List"),
		r.WithData(fiber.Map{
			"data":       users,
			"pagination": datatable.RenderPagination(pagination),
		}))
}

func (cc *Controller) GetUsersColumns(c fiber.Ctx) error {
	columns, err := cc.getUsersColumns(c.Context())
	if err != nil {
		return cc.app.Api(c, cc.app.Render().WithError(err))
	}

	return cc.app.Api(c, cc.app.Render().WithData(datatable.GetColumns(columns)))
}

func (cc *Controller) getUsersColumns(ctx context.Context) ([]datatable.Column, error) {
	roleNames, err := cc.loadAvailableRoleNames(ctx)
	if err != nil {
		return nil, err
	}

	var columns = []datatable.Column{
		{
			ID:          "id",
			AccessorKey: "id",
			Hidden:      true,
		},
		{
			ID:                 "full_name",
			SQLColumn:          "CONCAT(first_name, ' ', last_name)",
			AccessorKey:        "full_name",
			Header:             "Full Name",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Full Name",
				Variant:     "text",
				Placeholder: "Search full name...",
			},
		},
		{
			ID:                        "first_name",
			AccessorKey:               "first_name",
			Header:                    "First Name",
			Hidden:                    true,
			EnableSorting:             true,
			EnableOnlyAdvancedFilters: true,
			Meta: &datatable.ColumnMeta{
				Label:       "First Name",
				Variant:     "text",
				Placeholder: "Search first name...",
			},
		},
		{
			ID:                        "last_name",
			AccessorKey:               "last_name",
			Header:                    "Last Name",
			EnableSorting:             true,
			Hidden:                    true,
			EnableOnlyAdvancedFilters: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Last Name",
				Variant:     "text",
				Placeholder: "Search last name...",
			},
		},
		{
			ID:                        "email",
			AccessorKey:               "email",
			Header:                    "Email",
			EnableSorting:             true,
			Hidden:                    true,
			EnableOnlyAdvancedFilters: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Email",
				Variant:     "text",
				Placeholder: "Search email...",
			},
		},
		{
			ID:                 "status",
			IsJSON:             true,
			AccessorKey:        "status",
			Header:             "Status",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Status",
				Variant:     "multiSelect",
				Placeholder: "Search status...",
				Options: []datatable.OptionItem{
					{
						Label: "Active",
						Value: "active",
					},
					{
						Label: "New",
						Value: "new",
					},
					{
						Label: "Pending",
						Value: "pending",
					},
					{
						Label: "Inactive",
						Value: "inactive",
					},
					{
						Label: "Suspended",
						Value: "suspended",
					},
					{
						Label: "Deleted",
						Value: "deleted",
					},
				},
			},
		},
		{
			ID:                 "roles",
			AccessorKey:        "roles",
			Header:             "Roles",
			IsJSON:             true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Roles",
				Variant:     "multiSelect",
				Placeholder: "Filter by role...",
				Options:     roleFilterOptions(roleNames),
			},
		},
		{
			ID:            "last_login",
			AccessorKey:   "last_login",
			SQLColumn:     `(SELECT MAX(s.created_at) FROM sessions s WHERE s.user_id = users.id AND s.deleted_at IS NULL AND s.is_deleted = false)`,
			Header:        "Last Login",
			EnableSorting: true,
			Meta: &datatable.ColumnMeta{
				Label:   "Last Login",
				Variant: "date",
			},
		},
		// {
		// 	ID:                 "department",
		// 	SQLColumn:          "'[]'",
		// 	IsJSON:             true,
		// 	AccessorKey:        "department",
		// 	Header:             "Department",
		// 	EnableSorting:      true,
		// 	EnableColumnFilter: true,
		// 	Meta: &datatable.ColumnMeta{
		// 		Label:       "Department",
		// 		Variant:     "multiSelect",
		// 		Placeholder: "Search department...",
		// 		Options: []datatable.OptionItem{
		// 			{
		// 				Label: "IT",
		// 				Value: "it",
		// 			},
		// 			{
		// 				Label: "Marketing",
		// 				Value: "marketing",
		// 			},
		// 			{
		// 				Label: "Sales",
		// 				Value: "sales",
		// 			},
		// 			{
		// 				Label: "HR",
		// 				Value: "hr",
		// 			},
		// 			{
		// 				Label: "Finance",
		// 				Value: "finance",
		// 			},
		// 			{
		// 				Label: "Legal",
		// 				Value: "legal",
		// 			},
		// 			{
		// 				Label: "Customer Support",
		// 				Value: "customer_support",
		// 			},
		// 			{
		// 				Label: "Other",
		// 				Value: "other",
		// 			},
		// 		},
		// 	},
		// },
	}

	return columns, nil
}
