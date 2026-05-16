package config

import (
	"context"
	"errors"

	"github.com/flowtrove/packages/models"
	"github.com/flowtrove/packages/render"
	"gorm.io/gorm"
)

func (app *AppClients) withGeneralData() render.GeneralDataFunc {
	return func(ctx context.Context, serviceName string) (map[string]any, error) {
		return app.GeneralData(ctx, serviceName)
	}
}

func (app *AppClients) GeneralData(ctx context.Context, serviceName string) (map[string]any, error) {
	service, err := gorm.G[models.Service](app.postgres).
		Where("name = ?", serviceName).
		First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			service, err = gorm.G[models.Service](app.postgres).
				Where("name = ?", app.appService).
				First(ctx)
			if err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}

	navigations, err := app.getNavigationData(ctx, service.ID)
	if err != nil {
		return nil, err
	}

	services, err := app.getServicesData(ctx, "")
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"services":        services,
		"service":         service,
		"current_user_id": "",
		"navigations":     formatNavigation(navigations),
	}, nil
}

func (app *AppClients) getServicesData(ctx context.Context, userId string) ([]map[string]any, error) {
	services := []map[string]any{}
	svc, err := gorm.G[models.Service](app.postgres).
		Find(ctx)
	if err != nil {
		return nil, err
	}
	for _, svc := range svc {
		services = append(services, map[string]any{
			"id":          svc.ID,
			"name":        svc.Name,
			"title":       svc.Title,
			"icon":        svc.Icon,
			"description": svc.Description,
		})
	}

	return services, nil
}

func (app *AppClients) getNavigationData(ctx context.Context, serviceID string) ([]models.ServiceNavigation, error) {
	var serviceIDs []string
	err := app.postgres.Model(&models.Service{}).
		Where("id = ?", serviceID).
		Pluck("id", &serviceIDs).Error
	if err != nil {
		return nil, err
	}

	if len(serviceIDs) == 0 {
		return []models.ServiceNavigation{}, nil
	}

	navigations, err := gorm.G[models.ServiceNavigation](app.postgres).
		Where("service_id IN (?)", serviceIDs).
		Where("parent_id IS NULL").
		Order("order_nr ASC").
		Find(ctx)
	if err != nil {
		return nil, err
	}

	for i := range navigations {
		children, err := app.getNavigationChildren(ctx, serviceIDs, navigations[i].ID)
		if err != nil {
			return nil, err
		}
		navigations[i].Children = children
	}

	return navigations, nil
}

func (app *AppClients) getNavigationChildren(ctx context.Context, serviceIDs []string, parentID string) ([]models.ServiceNavigation, error) {
	children, err := gorm.G[models.ServiceNavigation](app.postgres).
		Where("service_id IN (?)", serviceIDs).
		Where("parent_id = ?", parentID).
		Order("order_nr ASC").
		Find(ctx)
	if err != nil {
		return nil, err
	}

	for i := range children {
		nestedChildren, err := app.getNavigationChildren(ctx, serviceIDs, children[i].ID)
		if err != nil {
			return nil, err
		}
		children[i].Children = nestedChildren
	}

	return children, nil
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
