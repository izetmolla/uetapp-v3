package config

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/flowtrove/packages/authorization/utils"
	"github.com/flowtrove/packages/models"
)

// requiredRoleNames normalizes jsonb role lists stored on services / navigations.
func requiredRoleNames(required models.JSONBArray) []string {
	if len(required) == 0 {
		return nil
	}
	out := make([]string, 0, len(required))
	for _, r := range required {
		if s, ok := r.(string); ok && s != "" {
			out = append(out, s)
		}
	}
	return out
}

func requiredRoleNamesFromStrings(required models.JSONBStringArray) []string {
	if len(required) == 0 {
		return nil
	}
	return []string(required)
}

// userCanAccessByRoles reports whether the user may access a resource guarded by required role names.
// Empty required means public (any authenticated user). Matches route middleware (hasRole only).
func (app *AppClients) userCanAccessByRoles(required []string, userRoles []string) bool {
	if len(required) == 0 {
		return true
	}
	if len(userRoles) == 0 {
		return false
	}
	hasRole, _, _ := app.GetRole(required, userRoles)
	return hasRole
}

func mergeRoleNames(base []string, extra ...string) []string {
	seen := make(map[string]struct{}, len(base)+len(extra))
	out := make([]string, 0, len(base)+len(extra))
	add := func(name string) {
		name = strings.TrimSpace(name)
		if name == "" {
			return
		}
		key := strings.ToLower(name)
		if _, ok := seen[key]; ok {
			return
		}
		seen[key] = struct{}{}
		out = append(out, name)
	}
	for _, r := range base {
		add(r)
	}
	for _, r := range extra {
		add(r)
	}
	return out
}

// userHasAdminRead reports whether the user holds the admin role with read permission.
// Admins may access any service and navigation entry (matches route middleware that lists "admin").
func (app *AppClients) userHasAdminRead(userRoles []string) bool {
	if len(userRoles) == 0 {
		return false
	}
	hasRole, canRead, _ := app.GetRole([]string{"admin"}, userRoles)
	return hasRole && canRead
}

// userCanAccessService checks DB service roles plus the service name (e.g. contracts:rw → contracts service).
func (app *AppClients) userCanAccessService(serviceRoles models.JSONBArray, serviceName string, userRoles []string) bool {
	if app.userHasAdminRead(userRoles) {
		return true
	}
	required := mergeRoleNames(requiredRoleNames(serviceRoles), serviceName)
	return app.userCanAccessByRoles(required, userRoles)
}

func (app *AppClients) userCanAccessNavigation(navRoles models.JSONBStringArray, userRoles []string) bool {
	if app.userHasAdminRead(userRoles) {
		return true
	}
	return app.userCanAccessByRoles(requiredRoleNamesFromStrings(navRoles), userRoles)
}

// freshUserRoles returns the latest roles from the users table, falling back to token/session roles.
func (app *AppClients) freshUserRoles(ctx context.Context, userID string, fallback []string) []string {
	if userID == "" || app.postgres == nil {
		return fallback
	}
	var raw json.RawMessage
	if err := app.postgres.WithContext(ctx).
		Table(models.User{}.TableName()).
		Select("roles").
		Where("id = ?", userID).
		Scan(&raw).Error; err != nil {
		return fallback
	}
	fresh := utils.FormatRoles(raw)
	if len(fresh) > 0 {
		return fresh
	}
	return fallback
}
