package globalsearch

import (
	"context"
)

func (c *Controller) getEmployeesToSearch(ctx context.Context, userRoles []string) (map[string]any, error) {
	data := map[string]any{
		"id":    "employees",
		"title": "Employees",
		"data":  []map[string]any{},
	}

	return data, nil
}
