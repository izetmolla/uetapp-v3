package datatable

import (
	"testing"
)

func TestParseFiltersJSONValuesField(t *testing.T) {
	raw := `[{"id":"roles","values":["admin","editor"],"operator":"inArray","variant":"multiSelect","filterId":"x"}]`
	filters, err := parseFiltersJSON(raw, map[string]struct{}{"roles": {}})
	if err != nil {
		t.Fatal(err)
	}
	if len(filters) != 1 {
		t.Fatalf("got %+v", filters)
	}
	if len(filters[0].Values) != 2 || filters[0].Value != "admin" {
		t.Fatalf("unexpected filter: %+v", filters[0])
	}
}

func TestParseFiltersJSONIsBetweenNumericArray(t *testing.T) {
	raw := `[{"id":"created_at","value":[1700000000000,1701000000000],"operator":"isBetween","variant":"date","filterId":"d1"}]`
	filters, err := parseFiltersJSON(raw, map[string]struct{}{"created_at": {}})
	if err != nil {
		t.Fatal(err)
	}
	if len(filters) != 1 {
		t.Fatalf("got %+v", filters)
	}
	if len(filters[0].Values) != 2 {
		t.Fatalf("expected 2 values, got %+v", filters[0].Values)
	}
	if filters[0].Values[0] != "1700000000000" || filters[0].Values[1] != "1701000000000" {
		t.Fatalf("unexpected values: %+v", filters[0].Values)
	}
}

func TestParseFiltersJSONIsEmptyOperator(t *testing.T) {
	raw := `[{"id":"email","operator":"isEmpty","variant":"text","filterId":"e1"}]`
	filters, err := parseFiltersJSON(raw, map[string]struct{}{"email": {}})
	if err != nil {
		t.Fatal(err)
	}
	if len(filters) != 1 {
		t.Fatalf("got %+v", filters)
	}
	if filters[0].Operator != OpIsEmpty {
		t.Fatalf("operator = %q", filters[0].Operator)
	}
}

func TestParseFiltersJSONSkipsUnknownColumns(t *testing.T) {
	raw := `[{"id":"unknown","value":"x","operator":"eq","variant":"text","filterId":"u1"}]`
	filters, err := parseFiltersJSON(raw, map[string]struct{}{"name": {}})
	if err != nil {
		t.Fatal(err)
	}
	if len(filters) != 0 {
		t.Fatalf("expected no filters, got %+v", filters)
	}
}

func TestParseFiltersJSONSkipsEmptyPayload(t *testing.T) {
	raw := `[{"id":"name","operator":"eq","variant":"text","filterId":"n1"}]`
	filters, err := parseFiltersJSON(raw, map[string]struct{}{"name": {}})
	if err != nil {
		t.Fatal(err)
	}
	if len(filters) != 0 {
		t.Fatalf("expected filter without value to be skipped, got %+v", filters)
	}
}

func TestFilterValues(t *testing.T) {
	t.Run("prefers Values slice", func(t *testing.T) {
		got := FilterValues(Filter{Values: []string{"a", "b"}, Value: "ignored"})
		if len(got) != 2 || got[0] != "a" {
			t.Fatalf("got %v", got)
		}
	})

	t.Run("falls back to Value", func(t *testing.T) {
		got := FilterValues(Filter{Value: "solo"})
		if len(got) != 1 || got[0] != "solo" {
			t.Fatalf("got %v", got)
		}
	})

	t.Run("trims whitespace", func(t *testing.T) {
		got := FilterValues(Filter{Values: []string{" a ", ""}})
		if len(got) != 1 || got[0] != "a" {
			t.Fatalf("got %v", got)
		}
	})
}

func TestColumnByID(t *testing.T) {
	columns := []Column{
		{ID: "roles", AccessorKey: "roles"},
		{ID: "full_name", AccessorKey: "full_name", SQLColumn: "CONCAT(first_name, ' ', last_name)"},
	}
	byID := ColumnByID(columns)
	if _, ok := byID["roles"]; !ok {
		t.Fatal("missing roles")
	}
	if byID["full_name"].SQLColumn == "" {
		t.Fatal("expected SQLColumn on full_name")
	}
}
