package globalsearch

import (
	"context"

	"github.com/flowtrove/packages/models"
	"gorm.io/gorm"
)

func (c *Controller) getServicesToSearch(ctx context.Context, userRoles []string) ([]map[string]any, error) {
	services, err := gorm.G[models.Service](c.app.Postgres()).
		Select("id, name, title, icon, description, roles").
		Where("status = ?", models.StatusActive).
		Order("name ASC").
		Find(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]map[string]any, 0, len(services))
	for _, svc := range services {
		if !c.app.UserCanAccessService(svc.Roles, svc.Name, userRoles) {
			continue
		}
		result = append(result, map[string]any{
			"id":    svc.ID,
			"name":  svc.Name,
			"title": svc.Title,
			"icon":  svc.Icon,
		})
	}
	return result, nil
}
