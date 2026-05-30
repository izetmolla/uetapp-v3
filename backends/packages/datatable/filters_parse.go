package datatable

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
)

// flexibleFilter mirrors the frontend advanced-filter JSON shape where `value`
// may be a string, string array (multiSelect / isBetween), or omitted (isEmpty).
type flexibleFilter struct {
	Type         string           `json:"type,omitempty"`
	ID           string           `json:"id"`
	Value        json.RawMessage  `json:"value,omitempty"`
	Values       []string         `json:"values,omitempty"`
	Variant      string           `json:"variant,omitempty"`
	Operator     string           `json:"operator,omitempty"`
	FilterID     string           `json:"filterId,omitempty"`
	JoinOperator string           `json:"joinOperator,omitempty"`
	Filters      []flexibleFilter `json:"filters,omitempty"`
}

// parseFiltersJSON parses a JSON array of filters (advanced or columnFilters mode).
func parseFiltersJSON(raw string, validColumns map[string]struct{}) ([]Filter, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" || !strings.HasPrefix(raw, "[") {
		return nil, nil
	}

	var items []flexibleFilter
	if err := json.Unmarshal([]byte(raw), &items); err != nil {
		return nil, err
	}

	out := make([]Filter, 0, len(items))
	for _, item := range items {
		if f, ok := parseFlexibleFilterItem(item, validColumns); ok {
			out = append(out, f)
		}
	}
	return out, nil
}

func parseFlexibleFilterItem(item flexibleFilter, validColumns map[string]struct{}) (Filter, bool) {
	if strings.EqualFold(strings.TrimSpace(item.Type), "group") || len(item.Filters) > 0 {
		nested := make([]Filter, 0, len(item.Filters))
		for _, child := range item.Filters {
			if f, ok := parseFlexibleFilterItem(child, validColumns); ok {
				nested = append(nested, f)
			}
		}
		if len(nested) == 0 {
			return Filter{}, false
		}
		return Filter{
			Type:         "group",
			JoinOperator: item.JoinOperator,
			Filters:      nested,
		}, true
	}

	if item.ID == "" {
		return Filter{}, false
	}
	if validColumns != nil {
		if _, ok := validColumns[item.ID]; !ok {
			return Filter{}, false
		}
	}

	f := Filter{
		ID:           item.ID,
		Variant:      item.Variant,
		Operator:     item.Operator,
		FilterID:     item.FilterID,
		JoinOperator: item.JoinOperator,
	}
	normalizeFilterValues(&f, item.Value, item.Values)

	if !filterHasPayload(f) {
		return Filter{}, false
	}
	return f, true
}

func normalizeFilterValues(f *Filter, rawValue json.RawMessage, values []string) {
	if len(values) > 0 {
		f.Values = append([]string(nil), values...)
		if f.Value == "" && len(f.Values) > 0 {
			f.Value = f.Values[0]
		}
		return
	}
	if len(rawValue) == 0 || string(rawValue) == "null" {
		return
	}

	var s string
	if err := json.Unmarshal(rawValue, &s); err == nil {
		if s != "" {
			f.Value = s
		}
		return
	}

	var arr []string
	if err := json.Unmarshal(rawValue, &arr); err == nil && len(arr) > 0 {
		f.Values = arr
		f.Value = arr[0]
		return
	}

	// isBetween may send numeric timestamps as JSON numbers in an array.
	var anyArr []any
	if err := json.Unmarshal(rawValue, &anyArr); err == nil && len(anyArr) > 0 {
		f.Values = make([]string, 0, len(anyArr))
		for _, v := range anyArr {
			if str, ok := jsonScalarToString(v); ok && str != "" {
				f.Values = append(f.Values, str)
			}
		}
		if len(f.Values) > 0 {
			f.Value = f.Values[0]
		}
	}
}

func jsonScalarToString(v any) (string, bool) {
	switch t := v.(type) {
	case string:
		return t, true
	case float64:
		if t == float64(int64(t)) {
			return strconv.FormatInt(int64(t), 10), true
		}
		return strconv.FormatFloat(t, 'f', -1, 64), true
	case json.Number:
		return t.String(), true
	default:
		return fmt.Sprint(t), true
	}
}

func filterHasPayload(f Filter) bool {
	op := strings.ToLower(strings.TrimSpace(f.Operator))
	if op == "isempty" || op == "isnotempty" {
		return true
	}
	if f.Value != "" || len(f.Values) > 0 {
		return true
	}
	return false
}

// FilterValues returns all scalar values for a filter (Values slice or single Value).
func FilterValues(f Filter) []string {
	if len(f.Values) > 0 {
		out := make([]string, 0, len(f.Values))
		for _, v := range f.Values {
			v = strings.TrimSpace(v)
			if v != "" {
				out = append(out, v)
			}
		}
		return out
	}
	if strings.TrimSpace(f.Value) != "" {
		return []string{strings.TrimSpace(f.Value)}
	}
	return nil
}

// enrichFiltersFromColumns fills missing variant metadata from column definitions.
func enrichFiltersFromColumns(filters []Filter, columns []Column) []Filter {
	if len(filters) == 0 || len(columns) == 0 {
		return filters
	}
	byID := ColumnByID(columns)
	out := make([]Filter, 0, len(filters))
	for _, f := range filters {
		if strings.EqualFold(f.Type, "group") {
			f.Filters = enrichFiltersFromColumns(f.Filters, columns)
			if len(f.Filters) > 0 {
				out = append(out, f)
			}
			continue
		}
		if f.Variant == "" {
			if col, ok := byID[f.ID]; ok && col.Meta != nil {
				f.Variant = col.Meta.Variant
			}
		}
		out = append(out, f)
	}
	return out
}

// ColumnByID maps column ID and AccessorKey to the full Column definition.
func ColumnByID(columns []Column) map[string]Column {
	m := make(map[string]Column, len(columns)*2)
	for _, c := range columns {
		if c.ID != "" {
			m[c.ID] = c
		}
		if c.AccessorKey != "" {
			m[c.AccessorKey] = c
		}
	}
	return m
}

func isFilterGroup(f Filter) bool {
	return strings.EqualFold(strings.TrimSpace(f.Type), "group") && len(f.Filters) > 0
}
