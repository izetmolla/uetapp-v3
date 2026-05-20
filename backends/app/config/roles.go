package config

import (
	"context"
	"strings"

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

// UserCanAccessService reports whether the user may access a service (exported for globalsearch and other packages).
func (app *AppClients) UserCanAccessService(serviceRoles models.JSONBArray, serviceName string, userRoles []string) bool {
	return app.userCanAccessService(serviceRoles, serviceName, userRoles)
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

func roleStringsFromJSONB(roles models.JSONBArray) []string {
	out := make([]string, 0, len(roles))
	for _, r := range roles {
		if s, ok := r.(string); ok && s != "" {
			out = append(out, s)
		}
	}
	return out
}

// FreshUserRoles returns the latest roles from the users table, falling back to token/session roles.
func (app *AppClients) FreshUserRoles(ctx context.Context, userID string, fallback []string) []string {
	return app.freshUserRoles(ctx, userID, fallback)
}

// freshUserRoles returns the latest roles from the users table, falling back to token/session roles.
func (app *AppClients) freshUserRoles(ctx context.Context, userID string, fallback []string) []string {
	if userID == "" || app.postgres == nil {
		return fallback
	}

	var user models.User
	if err := app.postgres.WithContext(ctx).
		Model(&models.User{}).
		Select("roles").
		Where("id = ?", userID).
		First(&user).Error; err != nil {
		return fallback
	}
	fresh := roleStringsFromJSONB(user.Roles)
	if len(fresh) > 0 {
		return fresh
	}
	return fallback
}
