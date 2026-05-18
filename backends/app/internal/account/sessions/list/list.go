package list

import (
	"github.com/flowtrove/packages/datatable"
	"github.com/flowtrove/packages/datatable/postgresql"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/pkg/tablequery"
)

func (cc *Controller) GetSessionsListAPI(c fiber.Ctx) error {
	authData, err := cc.app.USER(c, c.Context(), true)
	if err != nil {
		return cc.app.Api(c,
			cc.app.Render().WithError(err),
		)
	}

	db := cc.app.Postgres()
	r := cc.app.Render()
	columns, err := cc.getSessionsColumns()
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
	if len(q.Sorts) == 0 {
		q.Sorts = []datatable.Sort{{ID: "created_at", Desc: true}}
	}

	baseQuery := db.Model(&models.Session{}).
		Where("user_id = ?", authData.UserID).
		Where("is_deleted = ?", false)

	sessions, pagination, err := postgresql.Find[models.Session](baseQuery, q, columns)
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	return c.JSON(fiber.Map{
		"data":               sessions,
		"pagination":         datatable.RenderPagination(pagination),
		"current_session_id": authData.SessionID,
	})
}

func (cc *Controller) GetSessionsColumns(c fiber.Ctx) error {
	columns, err := cc.getSessionsColumns()
	if err != nil {
		return cc.app.Api(c, cc.app.Render().WithError(err))
	}

	return cc.app.Api(c, cc.app.Render().WithData(datatable.GetColumns(columns)))
}

func (cc *Controller) getSessionsColumns() ([]datatable.Column, error) {
	return []datatable.Column{
		{
			ID:          "id",
			AccessorKey: "id",
			Hidden:      true,
		},
		{
			ID:          "user_id",
			AccessorKey: "user_id",
			Hidden:      true,
		},
		{
			ID:                 "user_agent",
			AccessorKey:        "user_agent",
			Header:             "Device",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Device",
				Variant:     "text",
				Placeholder: "Search device or browser...",
			},
		},
		{
			ID:                 "ip_address",
			AccessorKey:        "ip_address",
			Header:             "IP Address",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "IP Address",
				Variant:     "text",
				Placeholder: "Search IP address...",
			},
		},
		{
			ID:                 "method",
			AccessorKey:        "method",
			Header:             "Method",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Method",
				Variant:     "multiSelect",
				Placeholder: "Filter method...",
				Options: []datatable.OptionItem{
					{Label: "Credentials", Value: "credentials"},
					{Label: "LDAP", Value: "ldap"},
					{Label: "OAuth", Value: "oauth"},
				},
			},
		},
		{
			ID:                 "created_at",
			AccessorKey:        "created_at",
			Header:             "Signed in",
			EnableSorting:      true,
			EnableColumnFilter: false,
			Meta: &datatable.ColumnMeta{
				Label:   "Signed in",
				Variant: "dateRange",
			},
		},
		{
			ID:                 "expires_at",
			AccessorKey:        "expires_at",
			Header:             "Expires",
			EnableSorting:      true,
			EnableColumnFilter: false,
			Meta: &datatable.ColumnMeta{
				Label:   "Expires",
				Variant: "dateRange",
			},
		},
		{
			ID:                 "updated_at",
			AccessorKey:        "updated_at",
			Header:             "Last activity",
			EnableSorting:      true,
			EnableColumnFilter: false,
			Hidden:             true,
			Meta: &datatable.ColumnMeta{
				Label:   "Last activity",
				Variant: "dateRange",
			},
		},
	}, nil
}
