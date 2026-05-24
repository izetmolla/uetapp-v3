package tablequery

import (
	"encoding/json"
	"strconv"
	"strings"

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

func GetPagination(c fiber.Ctx) datatable.Pagination {
	page := 1
	limit := 10

	if v := c.Query("pagination[page]"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			page = n
		}
	}
	if v := c.Query("pagination[perPage]"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			limit = n
		}
	}
	if v := c.Query("pagination[pageSize]"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			limit = n
		}
	}

	return datatable.Pagination{
		Page:  page,
		Limit: limit,
	}
}

// GetFilterValue returns the value of a filter for a single column from the current request.
// It looks at three sources, in this order:
//  1. A direct query string param: `?<column>=value` or `?<column>=v1,v2,v3`
//  2. The TanStack-style `columnFilters` JSON: `[{"id":"<column>","value":"v"}]`
//     or `[{"id":"<column>","values":["v1","v2"]}]`
//  3. The advanced `filters` JSON: same shape as columnFilters
//
// Single-value selections (just `value`) are returned as a single-item slice so callers
// can always treat the result as `[]string` regardless of the selection mode.
// Returns an empty (non-nil) slice when no filter is present for the column.
func GetFilterValue(q fiber.Ctx, column string) string {
	values := GetFilter(q, column)
	if len(values) > 0 {
		return values[0]
	}
	return ""
}

// GetFilter returns the filter values for a single column from the current request.
//
// It looks at three sources, in this order:
//  1. A direct query string param: `?<column>=value` or `?<column>=v1,v2,v3`
//  2. The TanStack-style `columnFilters` JSON: `[{"id":"<column>","value":"v"}]`
//     or `[{"id":"<column>","values":["v1","v2"]}]`
//  3. The advanced `filters` JSON: same shape as columnFilters
//
// Single-value selections (just `value`) are returned as a single-item slice so callers
// can always treat the result as `[]string` regardless of the selection mode.
// Returns an empty (non-nil) slice when no filter is present for the column.
func GetFilter(q fiber.Ctx, column string) []string {
	if column == "" {
		return []string{}
	}

	// 1. Direct query string param (e.g. `?study_level=master,bachelor`).
	if raw := q.Query(column); raw != "" {
		return splitCSV(raw)
	}

	// 2. TanStack-style `columnFilters=[{"id":"...","value":"...","values":[...]}]`.
	if values, ok := extractFromFiltersJSON(q.Query("columnFilters"), column); ok {
		return values
	}

	// 3. Advanced filter list `filters=[{"id":"...","value":"..."}]`.
	if values, ok := extractFromFiltersJSON(q.Query("filters"), column); ok {
		return values
	}

	return []string{}
}

// extractFromFiltersJSON parses a Filter JSON array and returns the values for the
// requested column. The second return value indicates whether a matching, non-empty
// filter was found.
func extractFromFiltersJSON(raw string, column string) ([]string, bool) {
	if raw == "" {
		return nil, false
	}
	var filters []datatable.Filter
	if err := json.Unmarshal([]byte(raw), &filters); err != nil {
		return nil, false
	}
	for _, f := range filters {
		if f.ID != column {
			continue
		}
		if len(f.Values) > 0 {
			out := make([]string, 0, len(f.Values))
			for _, v := range f.Values {
				if v != "" {
					out = append(out, v)
				}
			}
			if len(out) > 0 {
				return out, true
			}
		}
		if f.Value != "" {
			// Single selection: wrap in a one-item slice.
			return []string{f.Value}, true
		}
	}
	return nil, false
}

// splitCSV splits a comma-separated value into a trimmed, non-empty string slice.
// A single value with no commas returns a one-item slice.
func splitCSV(raw string) []string {
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	if len(out) == 0 {
		return []string{}
	}
	return out
}
