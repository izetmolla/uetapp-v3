package datatable

import "encoding/json"

// ColumnMeta holds UI/filter metadata for a column (TanStack Table–style).
// Used for labels, input variant, placeholder, and select options.
type ColumnMeta struct {
	Label       string       `json:"label"`
	Variant     string       `json:"variant"`
	Placeholder string       `json:"placeholder,omitempty"`
	Options     []OptionItem `json:"options,omitempty"`

	// Hidden hides this column's filter input from the simple filter toolbar
	// (it is still usable in advanced filters). The column itself is unaffected.
	Hidden bool `json:"hidden,omitempty"`

	// Disabled renders the filter input in a disabled (read-only) state on the frontend.
	// Use to show that filtering is currently unavailable (e.g. a dependent option set
	// has not been resolved yet) without removing the input from the UI.
	Disabled bool `json:"disabled,omitempty"`

	// FilterBy declares that this column's options depend on another column's filter value.
	// When the referenced column's filter changes, the frontend will refetch the columns
	// endpoint, forwarding the referenced filter value as a query parameter so the backend
	// can recompute Options accordingly (e.g. faculties depend on study_level).
	FilterBy string `json:"filterBy,omitempty"`
}

type OptionItem struct {
	Label string `json:"label"`
	Value string `json:"value"`
}

// Column is the backend column definition for the datatable (TanStack Table–aligned).
// Returned by Get*Columns and used for query validation, SQL mapping, and frontend column defs.
type Column struct {
	// ID is the stable column id (used in sorting/filtering state and as key).
	ID string `json:"id"`
	// SQLColumn is the DB expression for SELECT (e.g. "first_name", "CONCAT(a,b)").
	// If empty, ID (or AccessorKey) is used as the column name.
	SQLColumn string `json:"sqlColumn,omitempty"`
	// IsEmptySQL overrides the SQL used for isEmpty filters on computed columns.
	IsEmptySQL string `json:"isEmptySQL,omitempty"`
	// IsNotEmptySQL overrides the SQL used for isNotEmpty filters on computed columns.
	IsNotEmptySQL string `json:"isNotEmptySQL,omitempty"`

	// IsJSON indicates that the column is a JSON column.
	IsJSON bool `json:"isJSON,omitempty"`
	// AccessorKey is the key to access row data (TanStack accessorKey). Usually same as ID.
	AccessorKey string `json:"accessorKey"`
	// Header is the visible column header text.
	Header string `json:"header"`
	// Footer is optional footer content (TanStack footer).
	Footer string `json:"footer,omitempty"`

	// EnableSorting allows this column to be used in sort state.
	EnableSorting bool `json:"enableSorting"`
	// EnableColumnFilter allows this column to be used in column filters.
	EnableColumnFilter bool `json:"enableColumnFilter"`

	EnableOnlyAdvancedFilters bool `json:"enableOnlyAdvancedFilters"`
	// EnableHiding allows the column to be shown/hidden (e.g. column visibility UI).
	EnableHiding bool `json:"enableHiding"`

	// Size / MinSize / MaxSize for column sizing (TanStack column sizing).
	Size    int `json:"size,omitempty"`
	MinSize int `json:"minSize,omitempty"`
	MaxSize int `json:"maxSize,omitempty"`

	// Pinned pins the column left or right (TanStack column pinning). Values: "left", "right", "".
	Pinned string `json:"pinned,omitempty"`

	Hidden bool        `json:"hidden,omitempty"`
	Meta   *ColumnMeta `json:"meta,omitempty"`
}

type Pagination struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
	PageCount  int64 `json:"pageCount"`
}

func RenderPagination(pagination Pagination) Pagination {
	return Pagination{
		Page:       pagination.Page,
		Limit:      pagination.Limit,
		Total:      pagination.Total,
		TotalPages: pagination.TotalPages,
		PageCount:  pagination.PageCount,
	}
}

// Bool returns a pointer to b. Use for DefaultVisible (e.g. Bool(false) = column not rendered by default).
func Bool(b bool) *bool { return &b }

// Example: column that is not rendered on the table (e.g. row id for keys).
//
// Include it in your columns slice so the backend can use it for filtering/sorting
// and the frontend has a stable row key; set DefaultVisible to Bool(false) so the
// column is hidden by default and does not render in the table UI.
//
//   idColumn := datatable.Column{
//       ID:                 "id",
//       AccessorKey:        "id",
//       Header:             "ID",
//       EnableSorting:      true,
//       EnableColumnFilter: false,
//       EnableHiding:       true,
//       DefaultVisible:     datatable.Bool(false), // not rendered by default
//   }
//
// Or a column only used in exports/row actions, never shown:
//
//   internalRef := datatable.Column{
//       ID:                 "internal_ref",
//       SQLColumn:          "internal_ref",
//       AccessorKey:        "internalRef",
//       Header:             "Ref",
//       EnableSorting:      false,
//       EnableColumnFilter: false,
//       EnableHiding:       true,
//       DefaultVisible:     datatable.Bool(false),
//   }

type GetColumnsType struct {
	Columns          []Column        `json:"columns"`
	ColumnVisibility map[string]bool `json:"columnVisibility"`
}

// GetDataColumns returns only columns that are marked OnlyOnDataTable (e.g. for data fetch/SQL).
// Uses a new slice so the input is not modified; pointers are not needed for performance at typical column counts.
func GetColumns(columns []Column) GetColumnsType {
	out := GetColumnsType{
		Columns:          make([]Column, 0, len(columns)),
		ColumnVisibility: make(map[string]bool),
	}
	for _, c := range columns {
		out.Columns = append(out.Columns, c)
		out.ColumnVisibility[c.ID] = !c.Hidden
	}
	return GetColumnsType{
		Columns:          out.Columns,
		ColumnVisibility: out.ColumnVisibility,
	}
}

// FormatContent updates content in place. content is a slice of rows; each row is a map with keys = column IDs (or AccessorKey).
// For each row, values at keys for columns with IsJSON true are parsed as JSON and replaced. Nil rows are skipped.
// JSON column keys are computed once for efficiency.
func FormatContent(content *[]map[string]any, columns []Column) {
	if content == nil || len(columns) == 0 {
		return
	}
	// Precompute keys for JSON columns so we don't scan all columns per row.
	jsonKeys := make([]string, 0, len(columns))
	for _, c := range columns {
		if !c.IsJSON {
			continue
		}
		key := c.AccessorKey
		if key == "" {
			key = c.ID
		}
		if key != "" {
			jsonKeys = append(jsonKeys, key)
		}
	}
	if len(jsonKeys) == 0 {
		return
	}
	for i := range *content {
		row := (*content)[i]
		if row == nil {
			continue
		}
		for _, key := range jsonKeys {
			v := row[key]
			switch val := v.(type) {
			case string:
				var parsed any
				if err := json.Unmarshal([]byte(val), &parsed); err == nil {
					row[key] = parsed
				}
			case []byte:
				var parsed any
				if err := json.Unmarshal(val, &parsed); err == nil {
					row[key] = parsed
				}
			}
		}
	}
}
