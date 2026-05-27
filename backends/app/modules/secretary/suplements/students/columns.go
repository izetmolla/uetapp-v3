package students

import "github.com/flowtrove/packages/datatable"

func filterOptions(reference string) []datatable.OptionItem {
	var options []datatable.OptionItem
	for _, item := range mockFilterItems {
		if item["reference"] != reference {
			continue
		}
		options = append(options, datatable.OptionItem{
			Label: item["name"].(string),
			Value: item["id"].(string),
		})
	}
	return options
}

func getStudentsColumns() ([]datatable.Column, error) {
	return []datatable.Column{
		{
			ID:          "id",
			AccessorKey: "id",
			Hidden:      true,
		},
		{
			ID:                 "full_name",
			AccessorKey:        "full_name",
			Header:             "Emer/Mbiemer",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Emri i Plote",
				Variant:     "text",
				Placeholder: "Kerko studentin...",
			},
		},
		{
			ID:          "first_name",
			AccessorKey: "first_name",
			Header:      "Emri",
			Hidden:      true,
		},
		{
			ID:          "last_name",
			AccessorKey: "last_name",
			Header:      "Mbiemri",
			Hidden:      true,
		},
		{
			ID:          "student_code",
			AccessorKey: "student_code",
			Header:      "Kodi",
			Hidden:      true,
		},
		{
			ID:          "email",
			AccessorKey: "email",
			Header:      "Email",
			Hidden:      true,
		},
		{
			ID:          "image",
			AccessorKey: "image",
			Hidden:      true,
		},
		{
			ID:            "status",
			AccessorKey:   "status",
			Header:        "Statusi",
			EnableSorting: true,
		},
		{
			ID:                 "study_level",
			AccessorKey:        "study_level",
			Header:             "Niveli Studimit",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Niveli Studimit",
				Variant:     "multiSelect",
				Placeholder: "Zgjidh nivelin...",
				Options:     filterOptions("study_level"),
			},
		},
		{
			ID:                 "faculties",
			AccessorKey:        "faculty_id",
			Header:             "Fakultetet",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Fakultetet",
				Variant:     "multiSelect",
				Placeholder: "Zgjidh fakultetin...",
				Options:     filterOptions("faculties"),
			},
		},
		{
			ID:          "faculty_name",
			AccessorKey: "faculty_name",
			Hidden:      true,
		},
		{
			ID:                 "study_program",
			AccessorKey:        "study_program_id",
			Header:             "Programi Studimit",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Programi",
				Variant:     "multiSelect",
				Placeholder: "Zgjidh programin...",
				Options:     filterOptions("study_program"),
			},
		},
		{
			ID:          "study_program_name",
			AccessorKey: "study_program_name",
			Hidden:      true,
		},
		{
			ID:                 "study_profile",
			AccessorKey:        "study_profile_id",
			Header:             "Profili Studimit",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Profili",
				Variant:     "multiSelect",
				Placeholder: "Zgjidh profilin...",
				Options:     filterOptions("study_profile"),
			},
		},
		{
			ID:          "study_profile_name",
			AccessorKey: "study_profile_name",
			Hidden:      true,
		},
		{
			ID:                 "graduated_at",
			AccessorKey:        "graduated_at",
			Header:             "Diplomuar më",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:   "Diplomuar më",
				Variant: "dateRange",
			},
		},
		{
			ID:            "created_at",
			AccessorKey:   "created_at",
			Header:        "Krijuar",
			Hidden:        true,
			EnableSorting: true,
		},
	}, nil
}
