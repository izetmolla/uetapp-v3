package tablequery

import (
	"github.com/flowtrove/packages/datatable"
	"github.com/gofiber/fiber/v3"
)

// Extract parses datatable query params from the Fiber request (path + query string).
func Extract(c fiber.Ctx, columns []datatable.Column) (datatable.TableQuery, error) {
	uri := c.Request().URI()
	raw := string(uri.Path())
	if qs := uri.QueryString(); len(qs) > 0 {
		raw += "?" + string(qs)
	}
	return datatable.ExtractQuery(raw, columns)
}
