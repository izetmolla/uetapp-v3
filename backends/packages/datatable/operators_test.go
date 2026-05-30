package datatable

import (
	"strings"
	"testing"
)

func usersListColumns() []Column {
	return []Column{
		{
			ID:          "full_name",
			SQLColumn:   "CONCAT(first_name, ' ', last_name)",
			AccessorKey: "full_name",
			Meta:        &ColumnMeta{Variant: VariantText},
		},
		{
			ID:          "last_name",
			AccessorKey: "last_name",
			Meta:        &ColumnMeta{Variant: VariantText},
		},
		{
			ID:          "status",
			AccessorKey: "status",
			Meta:        &ColumnMeta{Variant: VariantMultiSelect},
		},
		{
			ID:          "roles",
			AccessorKey: "roles",
			IsJSON:      true,
			Meta:        &ColumnMeta{Variant: VariantMultiSelect},
		},
	}
}

func TestConditionForFilterRawTextILike(t *testing.T) {
	col := Column{ID: "last_name", AccessorKey: "last_name", Meta: &ColumnMeta{Variant: VariantText}}
	clause := conditionForFilterRaw("last_name", Filter{
		ID:       "last_name",
		Value:    "smith",
		Operator: OpILike,
		Variant:  VariantText,
	}, col)
	if !strings.Contains(clause, "last_name ILIKE '%smith%'") {
		t.Fatalf("got %q", clause)
	}
}

func TestConditionForFilterRawStatusInArray(t *testing.T) {
	col := Column{ID: "status", AccessorKey: "status", Meta: &ColumnMeta{Variant: VariantMultiSelect}}
	clause := conditionForFilterRaw("status", Filter{
		ID:       "status",
		Operator: OpInArray,
		Variant:  VariantMultiSelect,
		Values:   []string{"active", "pending"},
	}, col)
	if !strings.Contains(clause, "status IN ('active','pending')") {
		t.Fatalf("got %q", clause)
	}
}

func TestConditionForFilterRawRolesNotInArray(t *testing.T) {
	col := Column{ID: "roles", AccessorKey: "roles", IsJSON: true, Meta: &ColumnMeta{Variant: VariantMultiSelect}}
	clause := conditionForFilterRaw("roles", Filter{
		ID:       "roles",
		Operator: OpNotInArray,
		Variant:  VariantMultiSelect,
		Values:   []string{"guest"},
	}, col)
	if !strings.HasPrefix(clause, "NOT (") {
		t.Fatalf("expected NOT prefix, got %q", clause)
	}
	if !strings.Contains(clause, "jsonb_array_elements_text") {
		t.Fatalf("expected jsonb clause, got %q", clause)
	}
}

func TestConditionForFilterRawRolesIsEmpty(t *testing.T) {
	col := Column{ID: "roles", AccessorKey: "roles", IsJSON: true, Meta: &ColumnMeta{Variant: VariantMultiSelect}}
	clause := conditionForFilterRaw("roles", Filter{
		ID:       "roles",
		Operator: OpIsEmpty,
		Variant:  VariantMultiSelect,
	}, col)
	if !strings.Contains(clause, "'[]'::jsonb") {
		t.Fatalf("got %q", clause)
	}
}

func TestConditionForFilterRawIsBetween(t *testing.T) {
	col := Column{ID: "created_at", AccessorKey: "created_at", Meta: &ColumnMeta{Variant: VariantDate}}
	clause := conditionForFilterRaw("created_at", Filter{
		ID:       "created_at",
		Operator: OpIsBetween,
		Variant:  VariantDate,
		Values:   []string{"2024-01-01", "2024-12-31"},
	}, col)
	if clause != "created_at BETWEEN '2024-01-01' AND '2024-12-31'" {
		t.Fatalf("got %q", clause)
	}
}

func TestConditionsFromFiltersWithoutargsJoinOr(t *testing.T) {
	columns := usersListColumns()
	where := ConditionsFromFiltersWithoutargs([]Filter{
		{ID: "last_name", Operator: OpILike, Variant: VariantText, Value: "a"},
		{ID: "last_name", Operator: OpILike, Variant: VariantText, Value: "b"},
	}, JoinOr, columns)
	if !strings.Contains(where, " OR ") {
		t.Fatalf("expected OR join, got %q", where)
	}
	if strings.Count(where, "last_name ILIKE") != 2 {
		t.Fatalf("got %q", where)
	}
}

func TestConditionsFromFiltersWithoutargsFullNameExpression(t *testing.T) {
	columns := usersListColumns()
	where := ConditionsFromFiltersWithoutargs([]Filter{
		{
			ID:       "full_name",
			Operator: OpILike,
			Variant:  VariantText,
			Value:    "john",
		},
	}, JoinAnd, columns)
	if !strings.Contains(where, "CONCAT(first_name, ' ', last_name) ILIKE '%john%'") {
		t.Fatalf("got %q", where)
	}
}

func TestConditionsFromFiltersParameterized(t *testing.T) {
	columns := usersListColumns()
	where, args := ConditionsFromFilters([]Filter{
		{ID: "status", Operator: OpInArray, Variant: VariantMultiSelect, Values: []string{"active"}},
	}, JoinAnd, columns)
	if where != "(status IN (?))" {
		t.Fatalf("where = %q", where)
	}
	if len(args) != 1 {
		t.Fatalf("args = %v", args)
	}
}

func TestNormalizeFilterOperatorTextEqBecomesILike(t *testing.T) {
	op := normalizeFilterOperator(Filter{
		Operator: OpEq,
		Variant:  VariantText,
		Value:    "x",
	})
	if op != "ilike" {
		t.Fatalf("op = %q", op)
	}
}

func TestNormalizeFilterOperatorEmptyOperatorTextBecomesILike(t *testing.T) {
	op := normalizeFilterOperator(Filter{
		Variant: VariantText,
		Value:   "izet",
	})
	if op != "ilike" {
		t.Fatalf("op = %q", op)
	}
}

func TestConditionsFromFiltersWithoutargsSimpleTextSearchCaseInsensitive(t *testing.T) {
	columns := usersListColumns()
	where := ConditionsFromFiltersWithoutargs([]Filter{
		{ID: "full_name", Variant: VariantText, Value: "izet Molla"},
	}, JoinAnd, columns)
	if !strings.Contains(where, "ILIKE '%izet Molla%'") {
		t.Fatalf("expected case-insensitive ILIKE, got %q", where)
	}
}

func TestConditionsFromFiltersWithoutargsTextWithoutVariantUsesColumnMeta(t *testing.T) {
	columns := usersListColumns()
	where := ConditionsFromFiltersWithoutargs(
		enrichFiltersFromColumns([]Filter{{ID: "full_name", Value: "izet"}}, columns),
		JoinAnd,
		columns,
	)
	if !strings.Contains(where, "ILIKE '%izet%'") {
		t.Fatalf("expected ILIKE after variant enrichment, got %q", where)
	}
}
