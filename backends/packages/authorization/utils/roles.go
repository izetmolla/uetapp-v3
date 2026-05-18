package utils

import (
	"encoding/json"
	"strings"
)

// FormatRoles unmarshals a JSON role list into grant strings (e.g. "admin:rw").
// It accepts string arrays, mixed JSON arrays, and a single grant string.
func FormatRoles(roles json.RawMessage) []string {
	if len(roles) == 0 {
		return []string{}
	}

	var strs []string
	if err := json.Unmarshal(roles, &strs); err == nil {
		return normalizeRoleGrants(strs)
	}

	var anySlice []any
	if err := json.Unmarshal(roles, &anySlice); err == nil {
		return roleGrantsFromAnySlice(anySlice)
	}

	var single string
	if err := json.Unmarshal(roles, &single); err == nil {
		return normalizeRoleGrants([]string{single})
	}

	return []string{}
}

// NormalizeRoleGrants trims and drops empty role grant strings.
func NormalizeRoleGrants(grants []string) []string {
	return normalizeRoleGrants(grants)
}

func normalizeRoleGrants(grants []string) []string {
	if len(grants) == 0 {
		return []string{}
	}
	out := make([]string, 0, len(grants))
	for _, g := range grants {
		g = strings.TrimSpace(g)
		if g != "" {
			out = append(out, g)
		}
	}
	return out
}

func roleGrantsFromAnySlice(items []any) []string {
	out := make([]string, 0, len(items))
	for _, item := range items {
		switch v := item.(type) {
		case string:
			if s := strings.TrimSpace(v); s != "" {
				out = append(out, s)
			}
		}
	}
	return out
}
