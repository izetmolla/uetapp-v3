package config

import (
	"context"
	"strings"

	"github.com/flowtrove/packages/models"
	"gorm.io/gorm"
)

// rolesOverlapOrPublic matches rows whose jsonb roles array contains any user role, or is empty (public).
const rolesOverlapOrPublic = `(
	EXISTS (
		SELECT 1 FROM jsonb_array_elements_text(roles) AS role
		WHERE role IN ?
	)
	OR roles = '[]'::jsonb
)`

func (app *AppClients) getServicesData(ctx context.Context, roles []string) ([]map[string]any, error) {
	if len(roles) == 0 {
		return []map[string]any{}, nil
	}
	services := []map[string]any{}
	svc, err := gorm.G[models.Service](app.postgres).
		Select("id, name, title, icon, description").
		Where(rolesOverlapOrPublic, roles).
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

/**
 * Get the navigation data
 * @param ctx context.Context
 * @param serviceID string
 * @return []models.ServiceNavigation, error
 */
func (app *AppClients) getNavigationData(ctx context.Context, serviceID string, roles []string) ([]models.ServiceNavigation, error) {
	if serviceID == "" {
		return []models.ServiceNavigation{}, nil
	}

	navigations, err := gorm.G[models.ServiceNavigation](app.postgres).
		Where("service_id IN (?)", serviceID).
		Where(rolesOverlapOrPublic, roles).
		Where("parent_id IS NULL").
		Order("order_nr ASC").
		Find(ctx)
	if err != nil {
		return nil, err
	}

	for i := range navigations {
		children, err := app.getNavigationChildren(ctx, serviceID, navigations[i].ID, roles)
		if err != nil {
			return nil, err
		}
		navigations[i].Children = children
	}

	return navigations, nil
}

/**
 * Get the navigation children
 * @param ctx context.Context
 * @param serviceIDs []string
 * @param parentID string
 * @return []models.ServiceNavigation, error
 */
func (app *AppClients) getNavigationChildren(ctx context.Context, serviceID string, parentID string, roles []string) ([]models.ServiceNavigation, error) {
	children, err := gorm.G[models.ServiceNavigation](app.postgres).
		Where("service_id = ?", serviceID).
		Where("parent_id = ?", parentID).
		Where(rolesOverlapOrPublic, roles).
		Order("order_nr ASC").
		Find(ctx)
	if err != nil {
		return nil, err
	}

	for i := range children {
		nestedChildren, err := app.getNavigationChildren(ctx, serviceID, children[i].ID, roles)
		if err != nil {
			return nil, err
		}
		children[i].Children = nestedChildren
	}

	return children, nil
}

/**
 * Format the navigation data
 * @param navigation []models.ServiceNavigation
 * @return []map[string]any
 */
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

func removeRolePrefix(roles []string) []string {
	out := make([]string, 0, len(roles))
	for _, role := range roles {
		prefix, _, ok := strings.Cut(role, ":")
		if ok {
			out = append(out, prefix)
			continue
		}
		out = append(out, role)
	}
	return out
}
