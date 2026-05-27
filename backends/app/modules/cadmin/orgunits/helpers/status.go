package helpers

import "github.com/flowtrove/packages/datatable"

// ActiveInactiveStatusMeta returns column meta for status filters (multi-select, options from backend).
func ActiveInactiveStatusMeta() *datatable.ColumnMeta {
	return &datatable.ColumnMeta{
		Label:       "Status",
		Variant:     datatable.VariantMultiSelect,
		Placeholder: "Select status...",
		Options:     ActiveInactiveStatusOptions(),
	}
}

// ActiveInactiveStatusOptions are the allowed status values for faculty, department, and study level.
func ActiveInactiveStatusOptions() []datatable.OptionItem {
	return []datatable.OptionItem{
		{Label: "Active", Value: "active"},
		{Label: "Inactive", Value: "inactive"},
	}
}
