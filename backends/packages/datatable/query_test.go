package datatable

import (
	"strings"
	"testing"
)

func TestExtractQueryAdvancedFiltersJSON(t *testing.T) {
	columns := []Column{
		{ID: "roles", AccessorKey: "roles", IsJSON: true, Meta: &ColumnMeta{Variant: VariantMultiSelect}},
		{ID: "last_name", AccessorKey: "last_name", Meta: &ColumnMeta{Variant: VariantText}},
	}

	rawURL := `/users?filterFlag=advancedFilters&joinOperator=and&filters=[{"id":"roles","value":["admin","editor"],"variant":"multiSelect","operator":"inArray","filterId":"a1"},{"id":"last_name","value":"smith","variant":"text","operator":"iLike","filterId":"a2"}]`

	q, err := ExtractQuery(rawURL, columns)
	if err != nil {
		t.Fatal(err)
	}
	if q.JoinOperator != "and" {
		t.Fatalf("joinOperator = %q", q.JoinOperator)
	}
	if len(q.Filters) != 2 {
		t.Fatalf("expected 2 filters, got %+v", q.Filters)
	}

	roles := q.Filters[0]
	if roles.ID != "roles" || roles.Operator != "inArray" {
		t.Fatalf("unexpected roles filter: %+v", roles)
	}
	if len(roles.Values) != 2 || roles.Values[0] != "admin" || roles.Values[1] != "editor" {
		t.Fatalf("unexpected roles values: %+v", roles.Values)
	}

	lastName := q.Filters[1]
	if lastName.ID != "last_name" || lastName.Operator != "iLike" || lastName.Value != "smith" {
		t.Fatalf("unexpected last_name filter: %+v", lastName)
	}
}

func TestConditionsFromFiltersRolesInArray(t *testing.T) {
	columns := []Column{
		{ID: "roles", AccessorKey: "roles", IsJSON: true, Meta: &ColumnMeta{Variant: VariantMultiSelect}},
	}
	where := ConditionsFromFiltersWithoutargs([]Filter{
		{
			ID:       "roles",
			Operator: OpInArray,
			Variant:  VariantMultiSelect,
			Values:   []string{"admin", "editor"},
		},
	}, JoinAnd, columns)
	if where == "" {
		t.Fatal("expected non-empty where clause")
	}
	if !strings.Contains(where, "jsonb_array_elements_text") {
		t.Fatalf("expected jsonb role clause, got %q", where)
	}
	if !strings.Contains(where, "'admin'") || !strings.Contains(where, "'editor'") {
		t.Fatalf("expected role values in clause, got %q", where)
	}
}

func TestParseFiltersJSONValueArray(t *testing.T) {
	raw := `[{"id":"roles","value":["a","b"],"operator":"inArray","variant":"multiSelect","filterId":"x"}]`
	filters, err := parseFiltersJSON(raw, map[string]struct{}{"roles": {}})
	if err != nil {
		t.Fatal(err)
	}
	if len(filters) != 1 {
		t.Fatalf("got %+v", filters)
	}
	if len(filters[0].Values) != 2 {
		t.Fatalf("values not normalized: %+v", filters[0])
	}
}

func TestExtractQueryAdvancedFiltersWithValuesField(t *testing.T) {
	columns := []Column{
		{ID: "roles", AccessorKey: "roles", IsJSON: true, Meta: &ColumnMeta{Variant: VariantMultiSelect}},
	}
	rawURL := `/users?filterFlag=advancedFilters&joinOperator=and&filters=[{"id":"roles","values":["admin","editor"],"variant":"multiSelect","operator":"inArray","filterId":"a1"}]`

	q, err := ExtractQuery(rawURL, columns)
	if err != nil {
		t.Fatal(err)
	}
	if len(q.Filters) != 1 {
		t.Fatalf("expected 1 filter, got %+v", q.Filters)
	}
	if len(q.Filters[0].Values) != 2 {
		t.Fatalf("values = %+v", q.Filters[0].Values)
	}
}

func TestExtractQueryColumnFiltersJSON(t *testing.T) {
	columns := []Column{
		{ID: "status", AccessorKey: "status", Meta: &ColumnMeta{Variant: VariantMultiSelect}},
	}
	rawURL := `/users?columnFilters=[{"id":"status","values":["active","new"],"variant":"multiSelect"}]`

	q, err := ExtractQuery(rawURL, columns)
	if err != nil {
		t.Fatal(err)
	}
	if len(q.Filters) != 1 {
		t.Fatalf("expected 1 filter, got %+v", q.Filters)
	}
	if len(q.Filters[0].Values) != 2 {
		t.Fatalf("values = %+v", q.Filters[0].Values)
	}
}

func TestExtractQueryPaginationBracketParams(t *testing.T) {
	q, err := ExtractQuery("/users?pagination[page]=2&pagination[perPage]=25", nil)
	if err != nil {
		t.Fatal(err)
	}
	if q.Page != 2 || q.PageSize != 25 {
		t.Fatalf("page=%d pageSize=%d", q.Page, q.PageSize)
	}
}

func TestExtractQueryAdvancedOverridesColumnFilters(t *testing.T) {
	columns := []Column{
		{ID: "roles", AccessorKey: "roles", IsJSON: true},
		{ID: "status", AccessorKey: "status"},
	}
	rawURL := `/users?columnFilters=[{"id":"status","values":["active"]}]&filterFlag=advancedFilters&filters=[{"id":"roles","values":["admin"],"operator":"inArray","variant":"multiSelect","filterId":"r1"}]`

	q, err := ExtractQuery(rawURL, columns)
	if err != nil {
		t.Fatal(err)
	}
	if len(q.Filters) != 1 || q.Filters[0].ID != "roles" {
		t.Fatalf("advanced filters should replace column filters, got %+v", q.Filters)
	}
}

func TestExtractQuerySimpleTextColumnFilterILike(t *testing.T) {
	columns := []Column{
		{
			ID:          "full_name",
			SQLColumn:   "CONCAT(first_name, ' ', last_name)",
			AccessorKey: "full_name",
			Meta:        &ColumnMeta{Variant: VariantText},
		},
	}
	rawURL := `/users?columnFilters=[{"id":"full_name","value":"izet Molla","variant":"text","operator":"iLike"}]`

	q, err := ExtractQuery(rawURL, columns)
	if err != nil {
		t.Fatal(err)
	}
	if len(q.Filters) != 1 {
		t.Fatalf("expected 1 filter, got %+v", q.Filters)
	}
	where := ConditionsFromFiltersWithoutargs(q.Filters, q.JoinOperator, columns)
	if !strings.Contains(where, "ILIKE '%izet Molla%'") {
		t.Fatalf("expected ILIKE clause, got %q", where)
	}
}

func TestExtractQueryIsEmptyAdvancedFilter(t *testing.T) {
	columns := []Column{{ID: "email", AccessorKey: "email", Meta: &ColumnMeta{Variant: VariantText}}}
	rawURL := `/users?filterFlag=advancedFilters&filters=[{"id":"email","operator":"isEmpty","variant":"text","filterId":"e1"}]`

	q, err := ExtractQuery(rawURL, columns)
	if err != nil {
		t.Fatal(err)
	}
	if len(q.Filters) != 1 || q.Filters[0].Operator != OpIsEmpty {
		t.Fatalf("got %+v", q.Filters)
	}
}
