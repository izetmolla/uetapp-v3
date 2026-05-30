package datatable

import (
	"strings"
	"testing"
)

func TestNormalizeFilterOperatorUnaryOperators(t *testing.T) {
	unary := []string{
		OpIsEmpty,
		OpIsNotEmpty,
		OpIsBetween,
		OpIsRelativeToToday,
	}
	for _, operator := range unary {
		got := normalizeFilterOperator(Filter{
			Operator: operator,
			Variant:  VariantText,
		})
		if got != strings.ToLower(operator) {
			t.Fatalf("operator %q => %q", operator, got)
		}
	}
}

func TestConditionForFilterRawFullNameIsEmptyUsesTrimExpression(t *testing.T) {
	columns := usersListColumns()
	where := ConditionsFromFiltersWithoutargs([]Filter{
		{ID: "full_name", Operator: OpIsEmpty, Variant: VariantText},
	}, JoinAnd, columns)
	if !strings.Contains(where, "NULLIF(TRIM(CONCAT(first_name, ' ', last_name)), '') IS NULL") {
		t.Fatalf("expected trim-based empty check, got %q", where)
	}
}

func TestConditionForFilterRawFullNameIsNotEmptyUsesTrimExpression(t *testing.T) {
	columns := usersListColumns()
	where := ConditionsFromFiltersWithoutargs([]Filter{
		{ID: "full_name", Operator: OpIsNotEmpty, Variant: VariantText},
	}, JoinAnd, columns)
	if !strings.Contains(where, "NULLIF(TRIM(CONCAT(first_name, ' ', last_name)), '') IS NOT NULL") {
		t.Fatalf("expected trim-based not-empty check, got %q", where)
	}
}

func TestConditionForFilterRawLastNameIsEmptyUsesStandardCheck(t *testing.T) {
	columns := usersListColumns()
	where := ConditionsFromFiltersWithoutargs([]Filter{
		{ID: "last_name", Operator: OpIsEmpty, Variant: VariantText},
	}, JoinAnd, columns)
	if !strings.Contains(where, "last_name IS NULL OR last_name = ''") {
		t.Fatalf("got %q", where)
	}
}

func TestConditionForFilterRawTextOperators(t *testing.T) {
	col := Column{ID: "last_name", AccessorKey: "last_name", Meta: &ColumnMeta{Variant: VariantText}}
	tests := []struct {
		name     string
		filter   Filter
		contains string
	}{
		{
			name:     "notILike",
			filter:   Filter{ID: "last_name", Operator: OpNotILike, Variant: VariantText, Value: "smith"},
			contains: "NOT ILIKE '%smith%'",
		},
		{
			name:     "ne text becomes notILike",
			filter:   Filter{ID: "last_name", Operator: OpNe, Variant: VariantText, Value: "smith"},
			contains: "NOT ILIKE '%smith%'",
		},
		{
			name:     "eq text becomes ilike",
			filter:   Filter{ID: "last_name", Operator: OpEq, Variant: VariantText, Value: "smith"},
			contains: "ILIKE '%smith%'",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			clause := conditionForFilterRaw("last_name", tt.filter, col)
			if !strings.Contains(clause, tt.contains) {
				t.Fatalf("got %q", clause)
			}
		})
	}
}

func TestNormalizeFilterOperatorTextNeBecomesNotILike(t *testing.T) {
	op := normalizeFilterOperator(Filter{
		Operator: OpNe,
		Variant:  VariantText,
		Value:    "smith",
	})
	if op != "notilike" {
		t.Fatalf("op = %q", op)
	}
}

func TestNormalizeFilterOperatorSelectNeStaysNe(t *testing.T) {
	op := normalizeFilterOperator(Filter{
		Operator: OpNe,
		Variant:  VariantSelect,
		Value:    "active",
	})
	if op != "ne" {
		t.Fatalf("op = %q", op)
	}
}

func TestExtractQueryFullNameIsNotAdvancedFilter(t *testing.T) {
	columns := usersListColumns()
	rawURL := `/users?filterFlag=advancedFilters&filters=[{"id":"full_name","operator":"ne","value":"izet","variant":"text","filterId":"n1"}]`

	q, err := ExtractQuery(rawURL, columns)
	if err != nil {
		t.Fatal(err)
	}
	if len(q.Filters) != 1 || q.Filters[0].Operator != OpNe {
		t.Fatalf("got %+v", q.Filters)
	}
	where := ConditionsFromFiltersWithoutargs(q.Filters, q.JoinOperator, columns)
	if !strings.Contains(where, "NOT ILIKE '%izet%'") {
		t.Fatalf("expected NOT ILIKE for text 'Is not', got %q", where)
	}
}

func TestExtractQueryFullNameIsEmptyAdvancedFilter(t *testing.T) {
	columns := usersListColumns()
	rawURL := `/users?filterFlag=advancedFilters&filters=[{"id":"full_name","operator":"isEmpty","variant":"text","filterId":"e1"}]`

	q, err := ExtractQuery(rawURL, columns)
	if err != nil {
		t.Fatal(err)
	}
	if len(q.Filters) != 1 || q.Filters[0].Operator != OpIsEmpty {
		t.Fatalf("got %+v", q.Filters)
	}
	where := ConditionsFromFiltersWithoutargs(q.Filters, q.JoinOperator, columns)
	if !strings.Contains(where, "NULLIF(TRIM(CONCAT(first_name, ' ', last_name)), '') IS NULL") {
		t.Fatalf("got %q", where)
	}
}
