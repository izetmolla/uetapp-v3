package globalsearch

import (
	"context"
	"strings"

	"github.com/flowtrove/packages/drivers/httprequest"
	"github.com/flowtrove/packages/models"
	"gorm.io/gorm"
)

func (c *Controller) getStudentsToSearch(ctx context.Context, keyword string, _ []string) (map[string]any, error) {
	db := c.app.Postgres()
	data := map[string]any{
		"id":    "students",
		"title": "Students",
		"data":  []SearchStudentItem{},
	}

	resource, err := gorm.G[models.Resource](db).
		Select("id", "config").
		Where("id = ?", 3).
		First(ctx)
	if err != nil {
		return nil, err
	}

	req, err := httprequest.FromConfigContext(ctx, resource.Config)
	if err != nil {
		return nil, err
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
		req.Params = map[string]any{}
	}
	req.Params["action"] = "getUsers"
	if kw := strings.TrimSpace(keyword); kw != "" {
		req.Params["keyword"] = kw
	}

	res, err := httprequest.Execute[map[string]any](req)
	if err != nil {
		return nil, err
	}

	students, meta := parseStudentsSearchBody(res.Body)
	studentsItems, err := c.formatStudentsForSearch(ctx, students)
	if err != nil {
		return nil, err
	}
	data["data"] = studentsItems
	data["meta"] = meta
	return data, nil
}
