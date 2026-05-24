package importstudents

import (
	"context"
	"strings"

	"github.com/flowtrove/packages/datatable"
	"github.com/flowtrove/packages/drivers/httprequest"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/pkg/tablequery"
	"gorm.io/gorm"
)

func (cc *Controller) GetStudentsListAPI(c fiber.Ctx) error {
	db := cc.app.Postgres()
	ctxPtr := c.Context()
	_, err := cc.getStudentsColumns(ctxPtr)
	if err != nil {
		return cc.app.Api(c, cc.app.Render().WithError(err))
	}

	resource, err := gorm.G[models.Resource](db).
		Select("id", "config").
		Where("id = ?", 3).
		First(ctxPtr)
	if err != nil {
		return cc.app.Api(c, cc.app.Render().WithError(err))
	}

	req, err := httprequest.FromConfigContext(ctxPtr, resource.Config)
	if err != nil {
		return cc.app.Api(c, cc.app.Render().WithError(err))
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

	res, err := httprequest.Execute[map[string]any](req)
	if err != nil {
		return cc.app.Api(c, cc.app.Render().WithError(err))
	}

	return cc.app.Api(c, cc.app.Render().WithData(fiber.Map{
		"message": "Hello, World!",
		"res":     res,
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
	}, nil
}
