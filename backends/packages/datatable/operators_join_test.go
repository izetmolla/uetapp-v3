package datatable

import (
	"strings"
	"testing"
)

func TestConditionsFromFiltersWithoutargsMixedJoinOperators(t *testing.T) {
	columns := usersListColumns()
	filters := []Filter{
		{ID: "last_name", Operator: OpILike, Variant: VariantText, Value: "a"},
		{ID: "last_name", Operator: OpILike, Variant: VariantText, Value: "b", JoinOperator: JoinOr},
		{ID: "status", Operator: OpInArray, Variant: VariantMultiSelect, Values: []string{"active"}, JoinOperator: JoinAnd},
	}

	where := ConditionsFromFiltersWithoutargs(filters, JoinAnd, columns)
	if !strings.Contains(where, "last_name ILIKE '%a%'") {
		t.Fatalf("missing first clause: %q", where)
	}
	if !strings.Contains(where, " OR ") {
		t.Fatalf("expected OR between first and second clause: %q", where)
	}
	if !strings.Contains(where, " AND ") {
		t.Fatalf("expected AND between second and third clause: %q", where)
	}
	if strings.Index(where, " OR ") > strings.LastIndex(where, " AND ") {
		t.Fatalf("expected left-to-right OR before AND, got %q", where)
	}
}

func TestConditionsFromFiltersWithoutargsLegacyGlobalJoinOperator(t *testing.T) {
	columns := usersListColumns()
	filters := []Filter{
		{ID: "last_name", Operator: OpILike, Variant: VariantText, Value: "a"},
		{ID: "last_name", Operator: OpILike, Variant: VariantText, Value: "b"},
	}

	where := ConditionsFromFiltersWithoutargs(filters, JoinOr, columns)
	if strings.Count(where, " OR ") != 1 {
		t.Fatalf("expected global OR fallback, got %q", where)
	}
}

func TestExtractQueryPerFilterJoinOperators(t *testing.T) {
	columns := usersListColumns()
	rawURL := `/users?filterFlag=advancedFilters&filters=[{"id":"last_name","operator":"iLike","value":"a","variant":"text"},{"id":"status","operator":"inArray","values":["active"],"variant":"multiSelect","joinOperator":"or"}]`

	q, err := ExtractQuery(rawURL, columns)
	if err != nil {
		t.Fatal(err)
	}
	if len(q.Filters) != 2 {
		t.Fatalf("got %+v", q.Filters)
	}
	if q.Filters[1].JoinOperator != JoinOr {
		t.Fatalf("joinOperator = %q", q.Filters[1].JoinOperator)
	}
	where := ConditionsFromFiltersWithoutargs(q.Filters, q.JoinOperator, columns)
	if !strings.Contains(where, " OR ") {
		t.Fatalf("got %q", where)
	}
}

func TestConditionsFromFiltersWithoutargsGroupedEmailFilters(t *testing.T) {
	columns := usersListColumns()
	filters := []Filter{
		{
			ID:       "status",
			Operator: OpInArray,
			Variant:  VariantMultiSelect,
			Values:   []string{"active"},
		},
		{
			Type:         "group",
			JoinOperator: JoinAnd,
			Filters: []Filter{
				{ID: "email", Operator: OpILike, Variant: VariantText, Value: "molla"},
				{ID: "email", Operator: OpILike, Variant: VariantText, Value: "pollo", JoinOperator: JoinOr},
			},
		},
	}

	where := ConditionsFromFiltersWithoutargs(filters, JoinAnd, columns)
	if !strings.Contains(where, "status IN ('active')") {
		t.Fatalf("missing status clause: %q", where)
	}
	if !strings.Contains(where, "email ILIKE '%molla%'") {
		t.Fatalf("missing first email clause: %q", where)
	}
	if !strings.Contains(where, "email ILIKE '%pollo%'") {
		t.Fatalf("missing second email clause: %q", where)
	}
	if !strings.Contains(where, " AND ") {
		t.Fatalf("expected AND between status and group: %q", where)
	}
	if !strings.Contains(where, " OR ") {
		t.Fatalf("expected OR inside group: %q", where)
	}
}
