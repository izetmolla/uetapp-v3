package datatable

import (
	"fmt"
	"strings"
)

// OrderByClause builds a SQL ORDER BY fragment from sort state and column name mapping.
// Returns an empty string when there are no valid sorts.
func OrderByClause(sorts []Sort, columnNameByID map[string]string) string {
	if len(sorts) == 0 || columnNameByID == nil {
		return ""
	}

	parts := make([]string, 0, len(sorts))
	for _, s := range sorts {
		col, ok := columnNameByID[s.ID]
		if !ok || col == "" {
			continue
		}
		dir := "ASC"
		if s.Desc {
			dir = "DESC"
		}
		parts = append(parts, fmt.Sprintf("%s %s", col, dir))
	}

	if len(parts) == 0 {
		return ""
	}

	return " ORDER BY " + strings.Join(parts, ", ")
}
