package config

import (
	"context"
	"errors"

	"github.com/flowtrove/packages/models"
	"gorm.io/gorm"
)

func (app *AppClients) getServicesData(ctx context.Context, userRoles []string) ([]map[string]any, error) {
	services := []map[string]any{}
	svc, err := gorm.G[models.Service](app.postgres).
		Select("id, name, title, icon, description, roles").
		Where("status = ?", models.StatusActive).
		Order("name ASC").
		Find(ctx)
	if err != nil {
		return nil, err
	}
	for _, svc := range svc {
		if !app.userCanAccessService(svc.Roles, svc.Name, userRoles) {
			continue
		}
		services = append(services, map[string]any{
			"id":          svc.ID,
			"name":        svc.Name,
			"title":       svc.Title,
			"icon":        svc.Icon,
			"description": svc.Description,
			"roles":       svc.Roles,
		})
	}

	return services, nil
}

func (app *AppClients) getServiceData(ctx context.Context, serviceName string) (models.Service, error) {
	if serviceName == "" {
		serviceName = app.appService
	}
	service, err := gorm.G[models.Service](app.postgres).
		Select("id, name, title, icon, description, roles").
		Where("name = ?", serviceName).
		First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return app.getServiceData(ctx, app.appService)
		}
		return models.Service{}, err
	}
	return service, nil
}

func (app *AppClients) getNavigationData(ctx context.Context, serviceID string, userRoles []string) ([]models.ServiceNavigation, error) {
	if serviceID == "" {
		return []models.ServiceNavigation{}, nil
	}

	navigations, err := gorm.G[models.ServiceNavigation](app.postgres).
		Where("service_id = ?", serviceID).
		Where("parent_id IS NULL").
		Order("order_nr ASC").
		Find(ctx)
	if err != nil {
		return nil, err
	}

	filtered := make([]models.ServiceNavigation, 0, len(navigations))
	for i := range navigations {
		if !app.userCanAccessNavigation(navigations[i].Roles, userRoles) {
			continue
		}
		children, err := app.getNavigationChildren(ctx, serviceID, navigations[i].ID, userRoles)
		if err != nil {
			return nil, err
		}
		navigations[i].Children = children
		filtered = append(filtered, navigations[i])
	}

	return filtered, nil
}

func (app *AppClients) getNavigationChildren(ctx context.Context, serviceID string, parentID string, userRoles []string) ([]models.ServiceNavigation, error) {
	children, err := gorm.G[models.ServiceNavigation](app.postgres).
		Where("service_id = ?", serviceID).
		Where("parent_id = ?", parentID).
		Order("order_nr ASC").
		Find(ctx)
	if err != nil {
		return nil, err
	}

	filtered := make([]models.ServiceNavigation, 0, len(children))
	for i := range children {
		if !app.userCanAccessNavigation(children[i].Roles, userRoles) {
			continue
		}
		nestedChildren, err := app.getNavigationChildren(ctx, serviceID, children[i].ID, userRoles)
		if err != nil {
			return nil, err
		}
		children[i].Children = nestedChildren
		filtered = append(filtered, children[i])
	}

	return filtered, nil
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
