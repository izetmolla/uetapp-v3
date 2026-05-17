package datatable

import (
	"strconv"
	"strings"
)

// Operator names matching the frontend dataTableConfig.
const (
	OpILike             = "iLike"
	OpNotILike          = "notILike"
	OpEq                = "eq"
	OpNe                = "ne"
	OpInArray           = "inArray"
	OpNotInArray        = "notInArray"
	OpIsEmpty           = "isEmpty"
	OpIsNotEmpty        = "isNotEmpty"
	OpLt                = "lt"
	OpLte               = "lte"
	OpGt                = "gt"
	OpGte               = "gte"
	OpIsBetween         = "isBetween"
	OpIsRelativeToToday = "isRelativeToToday"
)

// Filter variant names matching the frontend filterVariants.
const (
	VariantText        = "text"
	VariantNumber      = "number"
	VariantRange       = "range"
	VariantDate        = "date"
	VariantDateRange   = "dateRange"
	VariantBoolean     = "boolean"
	VariantSelect      = "select"
	VariantMultiSelect = "multiSelect"
)

// JoinOperator values.
const (
	JoinAnd = "and"
	JoinOr  = "or"
)

// AllOperators is the list of operator values from the frontend config.
var AllOperators = []string{
	OpILike, OpNotILike, OpEq, OpNe, OpInArray, OpNotInArray,
	OpIsEmpty, OpIsNotEmpty, OpLt, OpLte, OpGt, OpGte,
	OpIsBetween, OpIsRelativeToToday,
}

// JoinOperators is the list of join operator values.
var JoinOperators = []string{JoinAnd, JoinOr}

// ConditionsFromFiltersWithoutargs builds a PostgreSQL WHERE fragment with values inlined (raw SQL).
// Use only when column names and filter values are trusted; otherwise prefer ConditionsFromFilters with bound args.
// Values are escaped for PostgreSQL (strings single-quoted and escaped).
func ConditionsFromFiltersWithoutargs(filters []Filter, joinOperator string, columnNameByID map[string]string) string {
	if len(filters) == 0 || columnNameByID == nil {
		return ""
	}
	op := strings.ToLower(strings.TrimSpace(joinOperator))
	if op != "or" {
		op = "and"
	}
	sep := " " + strings.ToUpper(op) + " "
	var clauses []string
	for _, f := range filters {
		col, ok := columnNameByID[f.ID]
		if !ok || col == "" {
			continue
		}
		clause := conditionForFilterRaw(col, f)
		if clause == "" {
			continue
		}
		clauses = append(clauses, "("+clause+")")
	}
	if len(clauses) == 0 {
		return ""
	}
	return strings.Join(clauses, sep)
}

// escapeSQLString escapes a string for use inside PostgreSQL single-quoted literal.
func escapeSQLString(s string) string {
	s = strings.ReplaceAll(s, `\`, `\\`)
	s = strings.ReplaceAll(s, `'`, `''`)
	return `'` + s + `'`
}

// conditionForFilterRaw returns one condition fragment with values inlined (raw SQL).
func conditionForFilterRaw(column string, f Filter) string {
	op := strings.ToLower(strings.TrimSpace(f.Operator))
	if op == "" {
		switch {
		case len(f.Values) == 0 && f.Value != "":
			op = "eq"
		case len(f.Values) == 1:
			op = "eq"
		case len(f.Values) > 1:
			op = "inarray"
		default:
			return ""
		}
	}
	// Text variant: use ILIKE with %value% (search) instead of exact match.
	if strings.ToLower(strings.TrimSpace(f.Variant)) == "text" && (op == "eq" || op == "=" || op == "==") {
		op = "ilike"
	}

	switch op {
	case "eq", "==", "=":
		return column + " = " + quoteValue(f.Value)
	case "ne", "neq", "!=":
		return column + " <> " + quoteValue(f.Value)
	case "ilike":
		return column + " ILIKE " + quoteValue("%"+f.Value+"%")
	case "notilike":
		return column + " NOT ILIKE " + quoteValue("%"+f.Value+"%")
	case "inarray", "in":
		if len(f.Values) > 0 {
			quoted := make([]string, len(f.Values))
			for i, v := range f.Values {
				quoted[i] = quoteValue(v)
			}
			return column + " IN (" + strings.Join(quoted, ",") + ")"
		}
		return column + " IN (" + quoteValue(f.Value) + ")"
	case "notinarray", "notin":
		if len(f.Values) > 0 {
			quoted := make([]string, len(f.Values))
			for i, v := range f.Values {
				quoted[i] = quoteValue(v)
			}
			return column + " NOT IN (" + strings.Join(quoted, ",") + ")"
		}
		return column + " NOT IN (" + quoteValue(f.Value) + ")"
	case "isempty":
		return "(" + column + " IS NULL OR " + column + " = '')"
	case "isnotempty":
		return "(" + column + " IS NOT NULL AND " + column + " <> '')"
	case "lt", "<":
		return column + " < " + quoteValue(f.Value)
	case "lte", "<=":
		return column + " <= " + quoteValue(f.Value)
	case "gt", ">":
		return column + " > " + quoteValue(f.Value)
	case "gte", ">=":
		return column + " >= " + quoteValue(f.Value)
	case "isbetween":
		if len(f.Values) >= 2 {
			return column + " BETWEEN " + quoteValue(f.Values[0]) + " AND " + quoteValue(f.Values[1])
		}
		if f.Value != "" {
			parts := strings.SplitN(f.Value, ",", 2)
			if len(parts) == 2 {
				return column + " BETWEEN " + quoteValue(strings.TrimSpace(parts[0])) + " AND " + quoteValue(strings.TrimSpace(parts[1]))
			}
		}
		return ""
	case "isrelativetotoday":
		return column + " = " + quoteValue(f.Value)
	}

	if len(f.Values) > 1 {
		quoted := make([]string, len(f.Values))
		for i, v := range f.Values {
			quoted[i] = quoteValue(v)
		}
		return column + " IN (" + strings.Join(quoted, ",") + ")"
	}
	if f.Value != "" {
		return column + " = " + quoteValue(f.Value)
	}
	return ""
}

// quoteValue returns a PostgreSQL-legal literal: numeric as-is, otherwise single-quoted escaped string.
func quoteValue(s string) string {
	if s == "" {
		return "''"
	}
	// Optional: treat numeric-looking values as numbers (no quotes)
	if _, err := strconv.ParseFloat(s, 64); err == nil {
		return s
	}
	if s == "true" || s == "false" {
		return s
	}
	return escapeSQLString(s)
}

// ConditionsFromFilters builds a PostgreSQL WHERE fragment and args from filters and joinOperator.
// columnNameByID maps filter ID (or AccessorKey) to the actual DB column name; only those columns are used.
// Returns the clause (with ? placeholders) and args so the caller can do: db.Where(clause, args...).
// joinOperator should be "and" or "or" (default "and").
func ConditionsFromFilters(filters []Filter, joinOperator string, columnNameByID map[string]string) (where string, args []any) {
	if len(filters) == 0 || columnNameByID == nil {
		return "", nil
	}
	op := strings.ToLower(strings.TrimSpace(joinOperator))
	if op != "or" {
		op = "and"
	}
	sep := " " + strings.ToUpper(op) + " "
	var clauses []string
	for _, f := range filters {
		col, ok := columnNameByID[f.ID]
		if !ok || col == "" {
			continue
		}
		clause, a := conditionForFilter(col, f)
		if clause == "" {
			continue
		}
		clauses = append(clauses, "("+clause+")")
		args = append(args, a...)
	}
	if len(clauses) == 0 {
		return "", nil
	}
	return strings.Join(clauses, sep), args
}

// conditionForFilter returns one condition fragment and its args for a single filter.
func conditionForFilter(column string, f Filter) (clause string, args []any) {
	op := strings.ToLower(strings.TrimSpace(f.Operator))
	// Normalise simple mode (no operator)
	if op == "" {
		switch {
		case len(f.Values) == 0 && f.Value != "":
			op = "eq"
		case len(f.Values) == 1:
			op = "eq"
		case len(f.Values) > 1:
			op = "inarray"
		default:
			return "", nil
		}
	}
	// Text variant: use ILIKE with %value% (search) instead of exact match.
	if strings.ToLower(strings.TrimSpace(f.Variant)) == "text" && (op == "eq" || op == "=" || op == "==") {
		op = "ilike"
	}

	switch op {
	case "eq", "==", "=":
		return column + " = ?", []any{f.Value}
	case "ne", "neq", "!=":
		return column + " <> ?", []any{f.Value}
	case "ilike":
		return column + " ILIKE ?", []any{"%" + f.Value + "%"}
	case "notilike":
		return column + " NOT ILIKE ?", []any{"%" + f.Value + "%"}
	case "inarray", "in":
		if len(f.Values) > 0 {
			placeholders := make([]string, len(f.Values))
			for i := range f.Values {
				placeholders[i] = "?"
			}
			return column + " IN (" + strings.Join(placeholders, ",") + ")", sliceToAny(f.Values)
		}
		return column + " IN (?)", []any{f.Value}
	case "notinarray", "notin":
		if len(f.Values) > 0 {
			placeholders := make([]string, len(f.Values))
			for i := range f.Values {
				placeholders[i] = "?"
			}
			return column + " NOT IN (" + strings.Join(placeholders, ",") + ")", sliceToAny(f.Values)
		}
		return column + " NOT IN (?)", []any{f.Value}
	case "isempty":
		return "(" + column + " IS NULL OR " + column + " = '')", nil
	case "isnotempty":
		return "(" + column + " IS NOT NULL AND " + column + " <> '')", nil
	case "lt", "<":
		return column + " < ?", []any{f.Value}
	case "lte", "<=":
		return column + " <= ?", []any{f.Value}
	case "gt", ">":
		return column + " > ?", []any{f.Value}
	case "gte", ">=":
		return column + " >= ?", []any{f.Value}
	case "isbetween":
		if len(f.Values) >= 2 {
			return column + " BETWEEN ? AND ?", []any{f.Values[0], f.Values[1]}
		}
		if f.Value != "" {
			// optional: treat Value as "min,max"
			parts := strings.SplitN(f.Value, ",", 2)
			if len(parts) == 2 {
				return column + " BETWEEN ? AND ?", []any{strings.TrimSpace(parts[0]), strings.TrimSpace(parts[1])}
			}
		}
		return "", nil
	case "isrelativetotoday":
		// Minimal support: treat value as day offset or leave to caller
		return column + " = ?", []any{f.Value}
	}

	// Fallback
	if len(f.Values) > 1 {
		placeholders := make([]string, len(f.Values))
		for i := range f.Values {
			placeholders[i] = "?"
		}
		return column + " IN (" + strings.Join(placeholders, ",") + ")", sliceToAny(f.Values)
	}
	if f.Value != "" {
		return column + " = ?", []any{f.Value}
	}
	return "", nil
}

func sliceToAny(s []string) []any {
	out := make([]any, len(s))
	for i, v := range s {
		out[i] = v
	}
	return out
}

// ColumnNameByID builds a map from column ID and AccessorKey to the DB column name (AccessorKey or ID).
// Pass the same columns slice used for the datatable so ConditionsFromFilters can resolve filter IDs.
func ColumnNameByID(columns []Column) map[string]string {
	m := make(map[string]string, len(columns)*2)
	for _, c := range columns {
		// Prefer SQLColumn (e.g. expressions like CONCAT(...)) for WHERE/ORDER BY.
		// Fall back to AccessorKey, then ID.
		name := c.SQLColumn
		if name == "" {
			name = c.AccessorKey
		}
		if name == "" {
			name = c.ID
		}
		if name == "" {
			continue
		}
		if c.ID != "" {
			m[c.ID] = name
		}
		if c.AccessorKey != "" {
			m[c.AccessorKey] = name
		}
	}
	return m
}
