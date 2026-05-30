package datatable

import (
	"fmt"
	"net/url"
	"strconv"
	"strings"
)

// FormatFilter renders a filter or group for debug logs.
func FormatFilter(f Filter) string {
	if isFilterGroup(f) {
		parts := make([]string, 0, len(f.Filters))
		for i, child := range f.Filters {
			part := FormatFilter(child)
			if i > 0 {
				join := resolveJoinOperator(child.JoinOperator, JoinAnd)
				parts = append(parts, strings.ToUpper(join))
			}
			parts = append(parts, part)
		}
		inner := strings.Join(parts, " ")
		if f.JoinOperator != "" {
			return "GROUP[" + strings.ToUpper(f.JoinOperator) + "](" + inner + ")"
		}
		return "GROUP(" + inner + ")"
	}

	value := f.Value
	if len(f.Values) > 0 {
		value = strings.Join(f.Values, ",")
	}
	return fmt.Sprintf("%s(%s %q)", f.ID, f.Operator, value)
}

// FormatTableQueryFilters renders parsed filters for debug logs.
func FormatTableQueryFilters(filters []Filter) string {
	if len(filters) == 0 {
		return "[]"
	}
	parts := make([]string, 0, len(filters))
	for i, f := range filters {
		part := FormatFilter(f)
		if i > 0 {
			join := resolveJoinOperator(f.JoinOperator, JoinAnd)
			parts = append(parts, strings.ToUpper(join))
		}
		parts = append(parts, part)
	}
	return strings.Join(parts, " ")
}

// parseBracketAdvancedFilters parses filters[0][id]=... query params, including nested groups
// such as filters[1][type]=group&filters[1][filters][0][id]=email.
func parseBracketAdvancedFilters(q url.Values, validColumns map[string]struct{}) []Filter {
	type groupBuilder struct {
		joinOperator string
		nested       map[int]*Filter
	}
	type topSlot struct {
		flat  *Filter
		group *groupBuilder
	}

	slots := make(map[int]*topSlot)

	for key, values := range q {
		if !strings.HasPrefix(key, "filters[") || len(values) == 0 {
			continue
		}
		inner := strings.TrimPrefix(key, "filters[")
		parts := strings.Split(inner, "][")
		if len(parts) < 2 {
			continue
		}
		topIndex, err := strconv.Atoi(parts[0])
		if err != nil || topIndex < 0 {
			continue
		}
		value := values[0]

		slot := slots[topIndex]
		if slot == nil {
			slot = &topSlot{}
			slots[topIndex] = slot
		}

		// Nested group filter: filters[1][filters][0][id]
		if len(parts) >= 4 && parts[1] == "filters" {
			nestedIndex, err := strconv.Atoi(parts[2])
			if err != nil || nestedIndex < 0 {
				continue
			}
			field := strings.TrimSuffix(parts[3], "]")
			if slot.group == nil {
				slot.group = &groupBuilder{nested: make(map[int]*Filter)}
			}
			entry := slot.group.nested[nestedIndex]
			if entry == nil {
				entry = &Filter{}
				slot.group.nested[nestedIndex] = entry
			}
			assignBracketFilterField(entry, field, value)
			continue
		}

		field := strings.TrimSuffix(parts[1], "]")
		if before, _, ok := strings.Cut(field, "]["); ok {
			field = before
		}

		switch field {
		case "type":
			if strings.EqualFold(value, "group") {
				if slot.group == nil {
					slot.group = &groupBuilder{nested: make(map[int]*Filter)}
				}
			}
		case "joinOperator":
			if slot.group != nil {
				slot.group.joinOperator = value
			} else {
				if slot.flat == nil {
					slot.flat = &Filter{}
				}
				slot.flat.JoinOperator = value
			}
		default:
			if slot.flat == nil {
				slot.flat = &Filter{}
			}
			assignBracketFilterField(slot.flat, field, value)
		}
	}

	if len(slots) == 0 {
		return nil
	}

	indices := make([]int, 0, len(slots))
	for idx := range slots {
		indices = append(indices, idx)
	}
	for i := 1; i < len(indices); i++ {
		j := i
		for j > 0 && indices[j-1] > indices[j] {
			indices[j-1], indices[j] = indices[j], indices[j-1]
			j--
		}
	}

	out := make([]Filter, 0, len(indices))
	for _, idx := range indices {
		slot := slots[idx]
		if slot == nil {
			continue
		}
		if slot.group != nil && len(slot.group.nested) > 0 {
			nested := collectBracketNestedFilters(slot.group.nested, validColumns)
			if len(nested) == 0 {
				continue
			}
			out = append(out, Filter{
				Type:         "group",
				JoinOperator: slot.group.joinOperator,
				Filters:      nested,
			})
			continue
		}
		if slot.flat == nil || slot.flat.ID == "" {
			continue
		}
		if validColumns != nil {
			if _, ok := validColumns[slot.flat.ID]; !ok {
				continue
			}
		}
		if !filterHasPayload(*slot.flat) && slot.flat.Operator != OpIsEmpty && slot.flat.Operator != OpIsNotEmpty {
			continue
		}
		out = append(out, *slot.flat)
	}

	return out
}

func assignBracketFilterField(entry *Filter, field, value string) {
	switch field {
	case "id":
		entry.ID = value
	case "value":
		entry.Values = append(entry.Values, value)
		entry.Value = value
	case "variant":
		entry.Variant = value
	case "operator":
		entry.Operator = value
	case "filterId":
		entry.FilterID = value
	case "joinOperator":
		entry.JoinOperator = value
	}
}

func collectBracketNestedFilters(nested map[int]*Filter, validColumns map[string]struct{}) []Filter {
	indices := make([]int, 0, len(nested))
	for idx := range nested {
		indices = append(indices, idx)
	}
	for i := 1; i < len(indices); i++ {
		j := i
		for j > 0 && indices[j-1] > indices[j] {
			indices[j-1], indices[j] = indices[j], indices[j-1]
			j--
		}
	}

	out := make([]Filter, 0, len(indices))
	for _, idx := range indices {
		f := nested[idx]
		if f == nil || f.ID == "" {
			continue
		}
		if validColumns != nil {
			if _, ok := validColumns[f.ID]; !ok {
				continue
			}
		}
		if !filterHasPayload(*f) && f.Operator != OpIsEmpty && f.Operator != OpIsNotEmpty {
			continue
		}
		out = append(out, *f)
	}
	return out
}
