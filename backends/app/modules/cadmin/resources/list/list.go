package list

import (
	"github.com/flowtrove/packages/datatable"
	"github.com/flowtrove/packages/datatable/postgresql"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/pkg/tablequery"
)

func (cc *Controller) GetResourcesListAPI(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()
	columns, err := cc.getResourcesColumns()
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

	rows, pagination, err := postgresql.FindRaw[map[string]any](db, q, columns, models.Resource{}.TableName()).Run()
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
		"drivers":    getDrivers(),
	})
}

func (cc *Controller) GetResourcesListView(c fiber.Ctx) error {
	ctxPtr := c.Context()
	db := cc.app.Postgres()
	r := cc.app.Render()
	columns, err := cc.getResourcesColumns()
	if err != nil {
		return cc.app.View(c, r.WithContext(ctxPtr), r.WithTitle("Resources"), r.WithError(err))
	}

	q, err := tablequery.Extract(c, columns)
	if err != nil {
		return cc.app.View(c, r.WithContext(ctxPtr), r.WithTitle("Resources"), r.WithError(err))
	}

	rows, pagination, err := postgresql.FindRaw[map[string]any](db, q, columns, models.Resource{}.TableName()).Run()
	if err != nil {
		return cc.app.View(c, r.WithContext(ctxPtr), r.WithTitle("Resources"), r.WithError(err))
	}

	datatable.FormatContent(&rows, columns)
	return cc.app.View(c, r.WithContext(ctxPtr), r.WithTitle("Resources"), r.WithData(fiber.Map{
		"data":       rows,
		"pagination": datatable.RenderPagination(pagination),
		"drivers":    getDrivers(),
	}))
}

func (cc *Controller) GetResourcesColumns(c fiber.Ctx) error {
	columns, err := cc.getResourcesColumns()
	if err != nil {
		return cc.app.Api(c, cc.app.Render().WithError(err))
	}

	return cc.app.Api(c, cc.app.Render().WithData(datatable.GetColumns(columns)))
}

func (cc *Controller) getResourcesColumns() ([]datatable.Column, error) {
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
				Placeholder: "Search name...",
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
			ID:                 "created_at",
			AccessorKey:        "created_at",
			Header:             "Created At",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Hidden:             true,
		},
	}, nil
}

func getDrivers() []map[string]any {
	return []map[string]any{
		{
			"value": models.ResourceDriverHTTPRequest,
			"label": "HTTP Request",
		},
		{
			"value": models.ResourceDriverMinio,
			"label": "Minio",
		},
		{
			"value": models.ResourceDriverPostgreSQL,
			"label": "PostgreSQL",
		},
		{
			"value": models.ResourceDriverRedis,
			"label": "Redis",
		},
		{
			"value": models.ResourceDriverMongoDB,
			"label": "MongoDB",
		},
		{
			"value": models.ResourceDriverKafka,
			"label": "Kafka",
		},
		{
			"value": models.ResourceDriverMSSQL,
			"label": "Microsoft SQL Server",
		},
		{
			"value": models.ResourceDriverTwilio,
			"label": "Twilio",
		},
		{
			"value": models.ResourceDriverTelegram,
			"label": "Telegram",
		},
		{
			"value": models.ResourceDriverWhatsApp,
			"label": "WhatsApp",
		},
		{
			"value": models.ResourceDriverSMTP,
			"label": "SMTP",
		},
		{
			"value": models.ResourceDriverNATS,
			"label": "NATS",
		},
	}
}
