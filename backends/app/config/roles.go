package config

import (
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

// userCanAccessByRoles reports whether the user may read a resource guarded by required.
// Empty required means public (any authenticated user).
func (app *AppClients) userCanAccessByRoles(required []string, userRoles []string) bool {
	if len(required) == 0 {
		return true
	}
	if len(userRoles) == 0 {
		return false
	}
	hasRole, canRead, _ := app.GetRole(required, userRoles)
	return hasRole && canRead
}

func (app *AppClients) userCanAccessService(serviceRoles models.JSONBArray, userRoles []string) bool {
	return app.userCanAccessByRoles(requiredRoleNames(serviceRoles), userRoles)
}

func (app *AppClients) userCanAccessNavigation(navRoles models.JSONBStringArray, userRoles []string) bool {
	return app.userCanAccessByRoles(requiredRoleNamesFromStrings(navRoles), userRoles)
}
