package departments

import (
	"github.com/flowtrove/packages/datatable"
	"github.com/flowtrove/packages/datatable/postgresql"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/internal/cadmin/orgunits/helpers"
	"github.com/uetedu/app/pkg/tablequery"
	"gorm.io/gorm"
)

func (cc *Controller) GetDepartmentsListAPI(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()
	columns, err := cc.getDepartmentsColumns(db)
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

	rows, pagination, err := postgresql.FindRaw[map[string]any](db, q, columns, models.Department{}.TableName()).
		AddJoin(helpers.DepartmentListJoin).
		Run()
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

func (cc *Controller) GetDepartmentsListView(c fiber.Ctx) error {
	ctxPtr := c.Context()
	db := cc.app.Postgres()
	r := cc.app.Render()
	columns, err := cc.getDepartmentsColumns(db)
	if err != nil {
		return cc.app.View(c, r.WithContext(ctxPtr), r.WithTitle("Departments"), r.WithError(err))
	}

	q, err := tablequery.Extract(c, columns)
	if err != nil {
		return cc.app.View(c, r.WithContext(ctxPtr), r.WithTitle("Departments"), r.WithError(err))
	}

	rows, pagination, err := postgresql.FindRaw[map[string]any](db, q, columns, models.Department{}.TableName()).
		AddJoin(helpers.DepartmentListJoin).
		Run()
	if err != nil {
		return cc.app.View(c, r.WithContext(ctxPtr), r.WithTitle("Departments"), r.WithError(err))
	}

	datatable.FormatContent(&rows, columns)
	return cc.app.View(c, r.WithContext(ctxPtr), r.WithTitle("Departments"), r.WithData(fiber.Map{
		"data":       rows,
		"pagination": datatable.RenderPagination(pagination),
		"query":      q,
	}))
}

func (cc *Controller) GetDepartmentsColumns(c fiber.Ctx) error {
	columns, err := cc.getDepartmentsColumns(cc.app.Postgres())
	if err != nil {
		return cc.app.Api(c, cc.app.Render().WithError(err))
	}
	return cc.app.Api(c, cc.app.Render().WithData(datatable.GetColumns(columns)))
}

func (cc *Controller) getDepartmentsColumns(db *gorm.DB) ([]datatable.Column, error) {
	facultyOptions, err := helpers.FacultyFilterOptions(db)
	if err != nil {
		return nil, err
	}

	return []datatable.Column{
		{ID: "id", AccessorKey: "id", SQLColumn: "departments.id", Hidden: true},
		{
			ID:                 "name",
			AccessorKey:        "name",
			SQLColumn:          "departments.name",
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
			ID:                 "faculty_name",
			AccessorKey:        "faculty_name",
			SQLColumn:          "faculties.name",
			Header:             "Faculty",
			EnableSorting:      true,
			EnableColumnFilter: false,
			Hidden:             true,
		},
		{
			ID:                 "faculty_id",
			AccessorKey:        "faculty_id",
			SQLColumn:          "departments.faculty_id",
			Header:             "Faculty",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Hidden:             true,
			Meta:               helpers.FacultyFilterMeta(facultyOptions),
		},
		{
			ID:                 "slug",
			AccessorKey:        "slug",
			SQLColumn:          "departments.slug",
			Header:             "Slug",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Hidden:             true,
		},
		{
			ID:                 "description",
			AccessorKey:        "description",
			SQLColumn:          "departments.description",
			Header:             "Description",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Hidden:             true,
		},
		{
			ID:                 "image",
			AccessorKey:        "image",
			SQLColumn:          "departments.image",
			Header:             "Image",
			EnableSorting:      false,
			EnableColumnFilter: false,
			Hidden:             true,
		},
		{
			ID:                 "status",
			AccessorKey:        "status",
			SQLColumn:          "departments.status",
			Header:             "Status",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta:               helpers.ActiveInactiveStatusMeta(),
		},
		{
			ID:                 "created_at",
			AccessorKey:        "created_at",
			SQLColumn:          "departments.created_at",
			Header:             "Created At",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Hidden:             true,
		},
	}, nil
}
