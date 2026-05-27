package students

import (
	"github.com/flowtrove/packages/datatable"
	"github.com/gofiber/fiber/v3"
)

func (c *Controller) GetStudentsListApi(ctx fiber.Ctx) error {
	r := c.app.Render()

	columns, err := getStudentsColumns()
	if err != nil {
		return c.app.Api(ctx,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	students, pagination, err := queryMockStudents(ctx, columns)
	if err != nil {
		return c.app.Api(ctx,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	return ctx.JSON(fiber.Map{
		"data":       students,
		"pagination": datatable.RenderPagination(pagination),
		"templates":  mockTemplatesData(),
	})
}

func (c *Controller) GetStudentsColumns(ctx fiber.Ctx) error {
	columns, err := getStudentsColumns()
	if err != nil {
		return c.app.Api(ctx, c.app.Render().WithError(err))
	}

	return c.app.Api(ctx, c.app.Render().WithData(datatable.GetColumns(columns)))
}

func (c *Controller) GetStudentsListView(ctx fiber.Ctx) error {
	return c.app.View(ctx, c.app.Render().WithData(fiber.Map{}))
}
