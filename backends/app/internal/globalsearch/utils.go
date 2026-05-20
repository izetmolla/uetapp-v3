package globalsearch

import (
	"context"

	"github.com/flowtrove/packages/models"
	"gorm.io/gorm"
)

func (c *Controller) getServicesToSearch(ctx context.Context, roles []string) ([]models.Service, error) {
	services, err := gorm.G[models.Service](c.app.Postgres()).
		Select("id, name, title, icon, roles").
		Where("roles @> ?", roles).
		Where("status = ?", models.StatusActive).
		Order("name ASC").
		Find(ctx)
	if err != nil {
		return nil, err
	}

	for _, service := range services {

	}
	return services, nil
}
