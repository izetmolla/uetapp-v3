package general

import (
	"context"
	"errors"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (cc *Controller) GetGeneralDataApi(c fiber.Ctx) error {
	render := cc.app.Render()
	reqCtx := c.Context()

	service, err := cc.getServiceData(reqCtx, c.Query("service", cc.app.ServiceName()))
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return cc.app.Api(c, render.WithError(err))
		}
	}
	navigations, err := cc.getNavigationData(reqCtx, c.Query("service", cc.app.ServiceName()))
	if err != nil {
		return cc.app.Api(c, render.WithError(err))
	}

	return cc.app.Api(c,
		render.WithContext(reqCtx),
		render.WithTitle("General Data"),
		render.WithData(fiber.Map{
			"service":         service,
			"current_user_id": "",
			"navigations":     formatNavigation(navigations),
		}))
}

func (cc *Controller) getServiceData(ctx context.Context, serviceName string) (*models.Service, error) {
	db := cc.app.Postgres()
	service, err := gorm.G[models.Service](db).
		Where("name = ?", serviceName).
		First(ctx)
	if err != nil {
		return nil, err
	}
	return &service, nil
}

func (cc *Controller) getNavigationData(ctx context.Context, serviceName string) ([]models.ServiceNavigation, error) {
	db := cc.app.Postgres()
	var serviceIDs []string
	err := db.Model(&models.Service{}).
		Where("name = ?", serviceName).
		Pluck("id", &serviceIDs).Error
	if err != nil {
		return nil, err
	}

	if len(serviceIDs) == 0 {
		return []models.ServiceNavigation{}, nil
	}

	navigations, err := gorm.G[models.ServiceNavigation](db).
		Where("service_id IN (?)", serviceIDs).
		Where("parent_id IS NULL").
		Order("order_nr ASC").
		Find(ctx)
	if err != nil {
		return nil, err
	}

	for i := range navigations {
		children, err := cc.getNavigationChildren(ctx, serviceIDs, navigations[i].ID)
		if err != nil {
			return nil, err
		}
		navigations[i].Children = children
	}

	return navigations, nil
}

func formatNavigation(navigation []models.ServiceNavigation) []map[string]any {
	navs := []map[string]any{}
	for _, n := range navigation {
		navs = append(navs, map[string]any{
			"title":       n.Title,
			"to":          n.To,
			"isNew":       n.IsNew,
			"isComing":    n.IsComing,
			"isDataBadge": n.IsDataBadge,
			"newTab":      n.NewTab,
			"isExternal":  n.IsExternal,
			"icon":        n.Icon,
			"orderNr":     n.OrderNr,
			"roles":       n.Roles,
			"children":    formatNavigation(n.Children),
		})
	}
	return navs
}
func (cc *Controller) getNavigationChildren(ctx context.Context, serviceIDs []string, parentID string) ([]models.ServiceNavigation, error) {
	db := cc.app.Postgres()
	children, err := gorm.G[models.ServiceNavigation](db).
		Where("service_id IN (?)", serviceIDs).
		Where("parent_id = ?", parentID).
		Order("order_nr ASC").
		Find(ctx)
	if err != nil {
		return nil, err
	}

	for i := range children {
		nestedChildren, err := cc.getNavigationChildren(ctx, serviceIDs, children[i].ID)
		if err != nil {
			return nil, err
		}
		children[i].Children = nestedChildren
	}

	return children, nil
}
