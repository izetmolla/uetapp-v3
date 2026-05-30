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
func ConditionsFromFiltersWithoutargs(filters []Filter, joinOperator string, columns []Column) string {
	if len(filters) == 0 || len(columns) == 0 {
		return ""
	}
	columnNameByID := ColumnNameByID(columns)
	columnByID := ColumnByID(columns)
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
		clause := conditionForFilterRaw(col, f, columnByID[f.ID])
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

// conditionForJSONBRoleGrants matches users whose roles JSON array includes any selected role
// (exact grant or role:perms prefix, e.g. admin or admin:rw).
func conditionForJSONBRoleGrants(column string, f Filter) string {
	values := FilterValues(f)
	if len(values) == 0 {
		return ""
	}

	parts := make([]string, 0, len(values))
	for _, role := range values {
		role = strings.TrimSpace(role)
		if role == "" {
			continue
		}
		exact := escapeSQLString(role)
		prefix := escapeSQLString(role + ":%")
		parts = append(parts, "EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE("+column+"::jsonb, '[]'::jsonb)) AS elem WHERE elem = "+exact+" OR elem LIKE "+prefix+")")
	}
	if len(parts) == 0 {
		return ""
	}
	return "(" + strings.Join(parts, " OR ") + ")"
}

func conditionForJSONBArrayContains(column string, f Filter) string {
	values := FilterValues(f)
	if len(values) == 0 {
		return ""
	}
	parts := make([]string, 0, len(values))
	for _, v := range values {
		escaped := escapeSQLString(v)
		parts = append(parts, "EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE("+column+"::jsonb, '[]'::jsonb)) AS elem WHERE elem = "+escaped+")")
	}
	if len(parts) == 0 {
		return ""
	}
	return "(" + strings.Join(parts, " OR ") + ")"
}

func jsonArrayIsEmptySQL(column string) string {
	return "(COALESCE(" + column + "::jsonb, '[]'::jsonb) = '[]'::jsonb OR " + column + " IS NULL)"
}

func jsonArrayIsNotEmptySQL(column string) string {
	return "(jsonb_array_length(COALESCE(" + column + "::jsonb, '[]'::jsonb)) > 0)"
}

func isRolesColumn(col Column) bool {
	return col.ID == "roles" || col.AccessorKey == "roles"
}

func isExpressionColumn(column string, col Column) bool {
	if col.IsEmptySQL != "" {
		return true
	}
	if col.SQLColumn == "" {
		return false
	}
	return col.SQLColumn != col.AccessorKey && col.SQLColumn != col.ID
}

func EmptyCheckSQL(column string, col Column) string {
	return emptyCheckSQL(column, col)
}

func NotEmptyCheckSQL(column string, col Column) string {
	return notEmptyCheckSQL(column, col)
}

func emptyCheckSQL(column string, col Column) string {
	if col.IsEmptySQL != "" {
		return col.IsEmptySQL
	}
	if isExpressionColumn(column, col) {
		return "(NULLIF(TRIM(" + column + "), '') IS NULL)"
	}
	return "(" + column + " IS NULL OR " + column + " = '')"
}

func notEmptyCheckSQL(column string, col Column) string {
	if col.IsNotEmptySQL != "" {
		return col.IsNotEmptySQL
	}
	if isExpressionColumn(column, col) {
		return "(NULLIF(TRIM(" + column + "), '') IS NOT NULL)"
	}
	return "(" + column + " IS NOT NULL AND " + column + " <> '')"
}

func isUnaryFilterOperator(op string) bool {
	switch op {
	case "isempty", "isnotempty", "isbetween", "isrelativetotoday":
		return true
	default:
		return false
	}
}

func isJSONMultiSelectColumn(col Column) bool {
	if !col.IsJSON {
		return false
	}
	if col.Meta != nil && strings.EqualFold(col.Meta.Variant, VariantMultiSelect) {
		return true
	}
	return isRolesColumn(col)
}

func NormalizeFilterOperator(f Filter) string {
	return normalizeFilterOperator(f)
}

func normalizeFilterOperator(f Filter) string {
	op := strings.ToLower(strings.TrimSpace(f.Operator))
	if isUnaryFilterOperator(op) {
		return op
	}
	if op == "" {
		switch {
		case len(FilterValues(f)) == 0:
			return ""
		case len(FilterValues(f)) == 1:
			op = "eq"
		default:
			op = "inarray"
		}
	}
	if strings.EqualFold(strings.TrimSpace(f.Variant), VariantText) {
		switch op {
		case "eq", "=", "==":
			return "ilike"
		case "ne", "neq", "!=":
			return "notilike"
		}
	}
	return op
}

func conditionForFilterRaw(column string, f Filter, col Column) string {
	op := normalizeFilterOperator(f)
	if op == "" {
		return ""
	}

	if isRolesColumn(col) {
		switch op {
		case "inarray", "in":
			return conditionForJSONBRoleGrants(column, f)
		case "notinarray", "notin":
			if clause := conditionForJSONBRoleGrants(column, f); clause != "" {
				return "NOT " + clause
			}
			return ""
		case "isempty":
			return jsonArrayIsEmptySQL(column)
		case "isnotempty":
			return jsonArrayIsNotEmptySQL(column)
		}
	}

	if isJSONMultiSelectColumn(col) && !isRolesColumn(col) {
		switch op {
		case "inarray", "in":
			return conditionForJSONBArrayContains(column, f)
		case "notinarray", "notin":
			if clause := conditionForJSONBArrayContains(column, f); clause != "" {
				return "NOT " + clause
			}
			return ""
		case "isempty":
			return jsonArrayIsEmptySQL(column)
		case "isnotempty":
			return jsonArrayIsNotEmptySQL(column)
		}
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
		values := FilterValues(f)
		if len(values) > 0 {
			quoted := make([]string, len(values))
			for i, v := range values {
				quoted[i] = quoteValue(v)
			}
			return column + " IN (" + strings.Join(quoted, ",") + ")"
		}
		return column + " IN (" + quoteValue(f.Value) + ")"
	case "notinarray", "notin":
		values := FilterValues(f)
		if len(values) > 0 {
			quoted := make([]string, len(values))
			for i, v := range values {
				quoted[i] = quoteValue(v)
			}
			return column + " NOT IN (" + strings.Join(quoted, ",") + ")"
		}
		return column + " NOT IN (" + quoteValue(f.Value) + ")"
	case "isempty":
		return emptyCheckSQL(column, col)
	case "isnotempty":
		return notEmptyCheckSQL(column, col)
	case "lt", "<":
		return column + " < " + quoteSQLComparable(f.Value)
	case "lte", "<=":
		return column + " <= " + quoteSQLComparable(f.Value)
	case "gt", ">":
		return column + " > " + quoteSQLComparable(f.Value)
	case "gte", ">=":
		return column + " >= " + quoteSQLComparable(f.Value)
	case "isbetween":
		values := FilterValues(f)
		if len(values) >= 2 {
			return column + " BETWEEN " + quoteSQLComparable(values[0]) + " AND " + quoteSQLComparable(values[1])
		}
		if f.Value != "" {
			parts := strings.SplitN(f.Value, ",", 2)
			if len(parts) == 2 {
				return column + " BETWEEN " + quoteSQLComparable(strings.TrimSpace(parts[0])) + " AND " + quoteSQLComparable(strings.TrimSpace(parts[1]))
			}
		}
		return ""
	case "isrelativetotoday":
		offset := strings.TrimSpace(f.Value)
		if offset == "" {
			return ""
		}
		// Value is day offset from today (e.g. "0" = today, "-1" = yesterday).
		return "(" + column + " >= (CURRENT_DATE + (" + quoteSQLComparable(offset) + ") * INTERVAL '1 day') AND " + column + " < (CURRENT_DATE + (" + quoteSQLComparable(offset) + " + 1) * INTERVAL '1 day'))"
	}

	values := FilterValues(f)
	if len(values) > 1 {
		quoted := make([]string, len(values))
		for i, v := range values {
			quoted[i] = quoteValue(v)
		}
		return column + " IN (" + strings.Join(quoted, ",") + ")"
	}
	if f.Value != "" {
		return column + " = " + quoteValue(f.Value)
	}
	return ""
}

// escapeSQLString escapes a string for use inside PostgreSQL single-quoted literal.
func escapeSQLString(s string) string {
	s = strings.ReplaceAll(s, `\`, `\\`)
	s = strings.ReplaceAll(s, `'`, `''`)
	return `'` + s + `'`
}

// quoteSQLComparable quotes timestamps and numerics without wildcards for comparisons.
func quoteSQLComparable(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return "''"
	}
	if _, err := strconv.ParseInt(s, 10, 64); err == nil {
		return s
	}
	if _, err := strconv.ParseFloat(s, 64); err == nil {
		return s
	}
	return quoteValue(s)
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
func ConditionsFromFilters(filters []Filter, joinOperator string, columns []Column) (where string, args []any) {
	if len(filters) == 0 || len(columns) == 0 {
		return "", nil
	}
	columnNameByID := ColumnNameByID(columns)
	columnByID := ColumnByID(columns)
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
		clause, a := conditionForFilter(col, f, columnByID[f.ID])
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
func conditionForFilter(column string, f Filter, col Column) (clause string, args []any) {
	op := normalizeFilterOperator(f)
	if op == "" {
		return "", nil
	}

	if isRolesColumn(col) {
		switch op {
		case "inarray", "in":
			if raw := conditionForJSONBRoleGrants(column, f); raw != "" {
				return raw, nil
			}
		case "notinarray", "notin":
			if raw := conditionForJSONBRoleGrants(column, f); raw != "" {
				return "NOT " + raw, nil
			}
		case "isempty":
			return jsonArrayIsEmptySQL(column), nil
		case "isnotempty":
			return jsonArrayIsNotEmptySQL(column), nil
		}
	}

	if isJSONMultiSelectColumn(col) && !isRolesColumn(col) {
		switch op {
		case "inarray", "in":
			if raw := conditionForJSONBArrayContains(column, f); raw != "" {
				return raw, nil
			}
		case "notinarray", "notin":
			if raw := conditionForJSONBArrayContains(column, f); raw != "" {
				return "NOT " + raw, nil
			}
		case "isempty":
			return jsonArrayIsEmptySQL(column), nil
		case "isnotempty":
			return jsonArrayIsNotEmptySQL(column), nil
		}
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
		values := FilterValues(f)
		if len(values) > 0 {
			placeholders := make([]string, len(values))
			for i := range values {
				placeholders[i] = "?"
			}
			return column + " IN (" + strings.Join(placeholders, ",") + ")", sliceToAny(values)
		}
		return column + " IN (?)", []any{f.Value}
	case "notinarray", "notin":
		values := FilterValues(f)
		if len(values) > 0 {
			placeholders := make([]string, len(values))
			for i := range values {
				placeholders[i] = "?"
			}
			return column + " NOT IN (" + strings.Join(placeholders, ",") + ")", sliceToAny(values)
		}
		return column + " NOT IN (?)", []any{f.Value}
	case "isempty":
		return emptyCheckSQL(column, col), nil
	case "isnotempty":
		return notEmptyCheckSQL(column, col), nil
	case "lt", "<":
		return column + " < ?", []any{f.Value}
	case "lte", "<=":
		return column + " <= ?", []any{f.Value}
	case "gt", ">":
		return column + " > ?", []any{f.Value}
	case "gte", ">=":
		return column + " >= ?", []any{f.Value}
	case "isbetween":
		values := FilterValues(f)
		if len(values) >= 2 {
			return column + " BETWEEN ? AND ?", []any{values[0], values[1]}
		}
		if f.Value != "" {
			parts := strings.SplitN(f.Value, ",", 2)
			if len(parts) == 2 {
				return column + " BETWEEN ? AND ?", []any{strings.TrimSpace(parts[0]), strings.TrimSpace(parts[1])}
			}
		}
		return "", nil
	case "isrelativetotoday":
		if raw := conditionForFilterRaw(column, f, col); raw != "" {
			return raw, nil
		}
		return column + " = ?", []any{f.Value}
	}

	values := FilterValues(f)
	if len(values) > 1 {
		placeholders := make([]string, len(values))
		for i := range values {
			placeholders[i] = "?"
		}
		return column + " IN (" + strings.Join(placeholders, ",") + ")", sliceToAny(values)
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
