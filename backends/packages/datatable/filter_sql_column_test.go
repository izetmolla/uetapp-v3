package datatable

import (
	"strings"
	"testing"
)

func TestFilterColumnNameByIDUsesFilterSQLColumn(t *testing.T) {
	columns := []Column{
		{
			ID:              "study_level",
			AccessorKey:     "study_level",
			SQLColumn:       "(SELECT sl.name FROM study_levels sl LIMIT 1)",
			FilterSQLColumn: "(SELECT ssp.study_level_id FROM student_study_programs ssp LIMIT 1)",
			Meta:            &ColumnMeta{Variant: VariantMultiSelect},
		},
	}

	selectMap := ColumnNameByID(columns)
	if !strings.Contains(selectMap["study_level"], "sl.name") {
		t.Fatalf("ColumnNameByID should use SQLColumn: %q", selectMap["study_level"])
	}

	filterMap := FilterColumnNameByID(columns)
	if !strings.Contains(filterMap["study_level"], "study_level_id") {
		t.Fatalf("FilterColumnNameByID should use FilterSQLColumn: %q", filterMap["study_level"])
	}
}

func TestConditionsFromFiltersWithoutargsStudyLevelIDFilter(t *testing.T) {
	columns := []Column{
		{
			ID:              "study_level",
			AccessorKey:     "study_level",
			SQLColumn:       "(SELECT sl.name FROM study_levels sl LIMIT 1)",
			FilterSQLColumn: "(SELECT ssp.study_level_id FROM student_study_programs ssp LIMIT 1)",
			Meta:            &ColumnMeta{Variant: VariantMultiSelect},
		},
	}

	where := ConditionsFromFiltersWithoutargs([]Filter{
		{
			ID:       "study_level",
			Operator: OpInArray,
			Variant:  VariantMultiSelect,
			Values:   []string{"2"},
		},
	}, JoinAnd, columns)

	if strings.Contains(where, "sl.name") {
		t.Fatalf("filter should not use display SQLColumn: %q", where)
	}
	if !strings.Contains(where, "study_level_id") || !strings.Contains(where, "IN (2)") {
		t.Fatalf("expected study_level_id filter with numeric id, got %q", where)
	}
}
