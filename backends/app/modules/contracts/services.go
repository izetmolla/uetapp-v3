package contracts

import (
	"context"
	"fmt"

	"github.com/flowtrove/packages/models"
	"github.com/uetedu/app/config"
	"gorm.io/gorm"
)

type Services struct {
	app *config.AppClients
}

func NewServices(app *config.AppClients) *Services {
	return &Services{
		app: app,
	}
}

func (c *Services) GetStorageResourceID(ctx context.Context) (int64, error) {
	option, err := gorm.G[models.StudentScanSettings](c.app.Postgres()).
		Select("value").
		Where("option = ?", "storage__resource_id").
		First(ctx)
	if err != nil {
		return 0, err
	}
	resource, err := gorm.G[models.Resource](c.app.Postgres()).
		Where("id = ?", option.Value).
		First(ctx)
	if err != nil {
		return 0, err
	}
	if resource.Driver != models.ResourceDriverMinio {
		return 0, fmt.Errorf("resource with id %d is not a minio resource", resource.ID)
	}
	return resource.ID, nil
}
