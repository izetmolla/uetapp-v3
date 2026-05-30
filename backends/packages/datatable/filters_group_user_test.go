package datatable

import (
	"net/url"
	"strings"
	"testing"
)

func TestParseFiltersJSONUserPayloadFirstNameEmailGroup(t *testing.T) {
	columns := map[string]struct{}{"first_name": {}, "email": {}}
	raw := `[{"id":"first_name","variant":"text","operator":"iLike","value":"izet"},{"type":"group","filters":[{"id":"email","variant":"text","operator":"iLike","value":"pollogati"}],"joinOperator":"and"}]`

	filters, err := parseFiltersJSON(raw, columns)
	if err != nil {
		t.Fatal(err)
	}
	if len(filters) != 2 {
		t.Fatalf("want 2 filters got %d: %+v", len(filters), filters)
	}
	if filters[1].Type != "group" || len(filters[1].Filters) != 1 {
		t.Fatalf("expected group with email filter, got %+v", filters[1])
	}
	if filters[1].Filters[0].Value != "pollogati" {
		t.Fatalf("expected pollogati, got %q", filters[1].Filters[0].Value)
	}
}

func TestExtractQueryUserPayloadFirstNameEmailGroup(t *testing.T) {
	columns := []Column{
		{ID: "first_name", AccessorKey: "first_name", Meta: &ColumnMeta{Variant: VariantText}},
		{ID: "email", AccessorKey: "email", Meta: &ColumnMeta{Variant: VariantText}},
	}
	raw := `[{"id":"first_name","variant":"text","operator":"iLike","value":"izet"},{"type":"group","filters":[{"id":"email","variant":"text","operator":"iLike","value":"pollogati"}],"joinOperator":"and"}]`
	rawURL := `/cadmin/users/list?filterFlag=advancedFilters&joinOperator=and&filters=` + raw

	q, err := ExtractQuery(rawURL, columns)
	if err != nil {
		t.Fatal(err)
	}
	if len(q.Filters) != 2 {
		t.Fatalf("ExtractQuery want 2 got %d: %s", len(q.Filters), FormatTableQueryFilters(q.Filters))
	}
	where := ConditionsFromFiltersWithoutargs(q.Filters, q.JoinOperator, columns)
	if !strings.Contains(where, "pollogati") || !strings.Contains(where, "izet") {
		t.Fatalf("unexpected where: %q", where)
	}
}

func TestParseBracketAdvancedFiltersWithGroup(t *testing.T) {
	columns := map[string]struct{}{"first_name": {}, "email": {}}
	q := url.Values{
		"filters[0][id]":                   {"first_name"},
		"filters[0][variant]":              {"text"},
		"filters[0][operator]":             {"iLike"},
		"filters[0][value]":                {"izet"},
		"filters[1][type]":                 {"group"},
		"filters[1][joinOperator]":         {"and"},
		"filters[1][filters][0][id]":       {"email"},
		"filters[1][filters][0][variant]":  {"text"},
		"filters[1][filters][0][operator]": {"iLike"},
		"filters[1][filters][0][value]":   {"pollogati"},
	}

	filters := parseBracketAdvancedFilters(q, columns)
	if len(filters) != 2 {
		t.Fatalf("want 2 filters got %d: %+v", len(filters), filters)
	}
	if filters[1].Type != "group" || len(filters[1].Filters) != 1 {
		t.Fatalf("expected group, got %+v", filters[1])
	}
	if filters[1].Filters[0].Value != "pollogati" {
		t.Fatalf("expected pollogati, got %q", filters[1].Filters[0].Value)
	}

	where := ConditionsFromFiltersWithoutargs(filters, JoinAnd, []Column{
		{ID: "first_name", AccessorKey: "first_name", Meta: &ColumnMeta{Variant: VariantText}},
		{ID: "email", AccessorKey: "email", Meta: &ColumnMeta{Variant: VariantText}},
	})
	if !strings.Contains(where, "pollogati") {
		t.Fatalf("where missing pollogati: %q", where)
	}
}

func TestFormatTableQueryFiltersWithGroup(t *testing.T) {
	formatted := FormatTableQueryFilters([]Filter{
		{ID: "first_name", Operator: OpILike, Value: "izet"},
		{
			Type:         "group",
			JoinOperator: JoinAnd,
			Filters: []Filter{
				{ID: "email", Operator: OpILike, Value: "pollogati"},
			},
		},
	})
	if !strings.Contains(formatted, "GROUP") || !strings.Contains(formatted, "pollogati") {
		t.Fatalf("unexpected format: %q", formatted)
	}
}

func TestConditionsFromFiltersUserPayloadFirstNameEmailGroup(t *testing.T) {
	columns := []Column{
		{ID: "first_name", AccessorKey: "first_name", Meta: &ColumnMeta{Variant: VariantText}},
		{ID: "email", AccessorKey: "email", Meta: &ColumnMeta{Variant: VariantText}},
	}
	raw := `[{"id":"first_name","variant":"text","operator":"iLike","value":"izet"},{"type":"group","filters":[{"id":"email","variant":"text","operator":"iLike","value":"pollogati"}],"joinOperator":"and"}]`

	filters, err := parseFiltersJSON(raw, map[string]struct{}{"first_name": {}, "email": {}})
	if err != nil {
		t.Fatal(err)
	}

	where, args := ConditionsFromFilters(filters, JoinAnd, columns)
	if where == "" {
		t.Fatal("empty where")
	}
	if !strings.Contains(where, "first_name") || !strings.Contains(where, "email") {
		t.Fatalf("unexpected where: %q", where)
	}
	if len(args) != 2 {
		t.Fatalf("want 2 args got %d: %v", len(args), args)
	}
	if args[0] != "%izet%" || args[1] != "%pollogati%" {
		t.Fatalf("unexpected args: %v", args)
	}

	rawWhere := ConditionsFromFiltersWithoutargs(filters, JoinAnd, columns)
	if !strings.Contains(rawWhere, "pollogati") || !strings.Contains(rawWhere, "izet") {
		t.Fatalf("unexpected raw where: %q", rawWhere)
	}
}
