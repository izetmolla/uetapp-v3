package datatable

import (
	"encoding/json"
	"net/url"
	"strconv"
	"strings"
)

// TableQuery represents the server-side interpretation of the
// datatable query parameters sent from the frontend `ServerTableState`.
//
// It is intentionally generic so it can be reused across different tables.
type TableQuery struct {
	// Pagination
	Page     int `json:"page"`
	PageSize int `json:"pageSize"`

	// Sorting (supports multi-column sorting).
	// The order of the slice represents sort precedence.
	Sorts []Sort `json:"sorts,omitempty"`

	// Global search value (if any)
	Search string `json:"search,omitempty"`

	// Column-specific filters with operators, variants, etc.
	Filters      []Filter `json:"filters,omitempty"`
	JoinOperator string   `json:"joinOperator,omitempty"`
}

// Sort represents a single sort instruction for a column.
// It is compatible with common datatable libraries that use
// an `{ id, desc }` shape for sorting state.
type Sort struct {
	ID   string `json:"id"`
	Desc bool   `json:"desc"`
}

// Filter represents a single column filter condition.
// It is compatible with URLs like:
//
//	filters[0][id]=name
//	filters[0][value]=izet
//	filters[0][variant]=text
//	filters[0][operator]=notILike
//	filters[0][filterId]=abc123
type Filter struct {
	ID string `json:"id"`
	// Value is the primary value for simple filters
	// (single-value inputs, text filters, etc.).
	Value string `json:"value,omitempty"`
	// Values holds multiple values for multi-select filters, e.g.
	//   columnFilters[1][value][0]=it
	//   columnFilters[1][value][1]=marketing
	Values   []string `json:"values,omitempty"`
	Variant  string   `json:"variant,omitempty"`
	Operator string   `json:"operator,omitempty"`
	FilterID string   `json:"filterId,omitempty"`
}

// ExtractQuery parses a Fiber OriginalURL (or any raw URL with query string)
// and converts it into a TableQuery structure that mirrors the semantics of
// the frontend `ServerTableState<TData>`.
//
// It also collaborates with the provided column definitions to:
//   - validate sort keys (only allow sorting by known columns)
//   - validate filter keys (only allow filters on known columns)
//
// Expected / supported query parameters (convention-based):
//   - page:      current page index (1-based, defaults to 1)
//   - pageSize:  number of records per page (defaults to 10)
//   - sortBy:    column id or accessor key (legacy single-sort, mapped to Sorts[0])
//   - sortDir:   "asc" or "desc" (legacy single-sort direction)
//   - sort[n][id]:   column id for the nth sort level (0-based)
//   - sort[n][desc]: "true"/"false" (or "1"/"0") for nth sort direction
//   - search:    global search term
//   - q:         alias for global search term
//   - filter[<column>]=<value> : column-level filters (e.g. filter[name]=john)
func ExtractQuery(rawURL string, columns []Column) (TableQuery, error) {
	// Default query values
	result := TableQuery{
		Page:     1,
		PageSize: 10,
	}

	// Build a lookup of valid column keys (id + accessorKey) so that
	// only declared columns can be used for sorting / filtering.
	validColumns := make(map[string]struct{})
	for _, col := range columns {
		if col.ID != "" {
			validColumns[col.ID] = struct{}{}
		}
		if col.AccessorKey != "" {
			validColumns[col.AccessorKey] = struct{}{}
		}

	}

	if rawURL == "" {
		return result, nil
	}

	u, err := url.Parse(rawURL)
	if err != nil {
		return result, err
	}

	q := u.Query()
	filterFlag := q.Get("filterFlag")

	// --- JSON-based params (TanStack-style state serialised as JSON strings) ---

	// Pagination from `pagination={ "pageIndex": 0, "pageSize": 10 }`
	if raw := q.Get("pagination"); raw != "" {
		var p struct {
			PageIndex int `json:"pageIndex"`
			PageSize  int `json:"pageSize"`
		}
		if err := json.Unmarshal([]byte(raw), &p); err == nil {
			if p.PageIndex >= 0 {
				// Convert 0-based pageIndex (frontend) to 1-based Page (backend).
				result.Page = p.PageIndex + 1
			}
			if p.PageSize > 0 {
				result.PageSize = p.PageSize
			}
		}
	}

	// --- Pagination from bracket-style params: pagination[page]=1, pagination[perPage]=10 ---
	if v := q.Get("pagination[page]"); v != "" {
		if page, err := strconv.Atoi(v); err == nil && page > 0 {
			result.Page = page
		}
	}
	if v := q.Get("pagination[perPage]"); v != "" {
		if size, err := strconv.Atoi(v); err == nil && size > 0 {
			result.PageSize = size
		}
	}
	if v := q.Get("pagination[pageSize]"); v != "" {
		if size, err := strconv.Atoi(v); err == nil && size > 0 {
			result.PageSize = size
		}
	}

	// Sorting from `sorting=[{"id":"name","desc":true}, ...]`
	if raw := q.Get("sorting"); raw != "" {
		var sorts []Sort
		if err := json.Unmarshal([]byte(raw), &sorts); err == nil {
			for _, s := range sorts {
				if _, ok := validColumns[s.ID]; ok && s.ID != "" {
					result.Sorts = append(result.Sorts, s)
				}
			}
		}
	}

	// Column filters from `columnFilters=[{"id":"name","value":"john"}, ...]`
	if raw := q.Get("columnFilters"); raw != "" {
		var filters []Filter
		if err := json.Unmarshal([]byte(raw), &filters); err == nil {
			for _, f := range filters {
				if _, ok := validColumns[f.ID]; !ok || f.ID == "" || f.Value == "" {
					continue
				}
				result.Filters = append(result.Filters, f)
			}
		}
	}

	// --- Sorting: multi-sort via indexed query params (fallback if no JSON sorting) ---
	if len(result.Sorts) == 0 {
		// Expect keys like: sorting[0][id], sorting[0][desc], sorting[1][id], ...
		sortMap := make(map[int]*Sort)
		for key, values := range q {
			if !strings.HasPrefix(key, "sorting[") {
				continue
			}

			// strip leading "sorting[" -> "0][id]" or similar
			inner := strings.TrimPrefix(key, "sorting[")
			parts := strings.SplitN(inner, "][", 2)
			if len(parts) != 2 {
				continue
			}

			indexStr := parts[0]                       // "0"
			field := strings.TrimSuffix(parts[1], "]") // "id" or "desc"

			idx, err := strconv.Atoi(indexStr)
			if err != nil || idx < 0 {
				continue
			}

			if len(values) == 0 {
				continue
			}
			value := values[0]

			entry, ok := sortMap[idx]
			if !ok {
				entry = &Sort{}
				sortMap[idx] = entry
			}

			switch field {
			case "id":
				// Only accept valid column ids / accessor keys.
				if _, ok := validColumns[value]; ok {
					entry.ID = value
				}
			case "desc":
				lower := strings.ToLower(value)
				entry.Desc = lower == "true" || lower == "1" || lower == "desc"
			}
		}

		// Materialise sorted Sort slice in index order, skipping
		// entries without a valid column ID.
		if len(sortMap) > 0 {
			indices := make([]int, 0, len(sortMap))
			for idx := range sortMap {
				indices = append(indices, idx)
			}
			// simple insertion sort to avoid importing sort package just for this
			for i := 1; i < len(indices); i++ {
				j := i
				for j > 0 && indices[j-1] > indices[j] {
					indices[j-1], indices[j] = indices[j], indices[j-1]
					j--
				}
			}

			for _, idx := range indices {
				s := sortMap[idx]
				if s != nil && s.ID != "" {
					result.Sorts = append(result.Sorts, *s)
				}
			}
		}
	}

	// --- Sorting: legacy single-sort (fallback of fallbacks) ---
	if len(result.Sorts) == 0 {
		sortBy := q.Get("sortBy")
		if _, ok := validColumns[sortBy]; ok && sortBy != "" {
			sortDir := strings.ToLower(q.Get("sortDir"))
			desc := sortDir == "desc"
			result.Sorts = append(result.Sorts, Sort{
				ID:   sortBy,
				Desc: desc,
			})
		}
	}

	// Pagination: page
	if v := q.Get("page"); v != "" {
		if page, err := strconv.Atoi(v); err == nil && page > 0 {
			result.Page = page
		}
	}

	// Pagination: pageSize
	if v := q.Get("pageSize"); v != "" {
		if size, err := strconv.Atoi(v); err == nil && size > 0 {
			result.PageSize = size
		}
	}

	// Global search (support both "search" and "q")
	if search := q.Get("search"); search != "" {
		result.Search = search
	} else if search := q.Get("q"); search != "" {
		result.Search = search
	}

	// Column filters: we support TWO distinct modes.
	//   - If the URL has keys "filters[...]" -> parse advanced filters (and joinOperator).
	//   - Else if the URL has keys "columnFilters[...]" -> parse simple columnFilters.
	if len(result.Filters) == 0 {
		hasAdvanced := filterFlag == "advancedFilters"
		if !hasAdvanced {
			for key := range q {
				if strings.HasPrefix(key, "filters[") {
					hasAdvanced = true
					break
				}
			}
		}
		// 1) Advanced filters: filters[0][...] with joinOperator.
		if hasAdvanced {
			filterMap := make(map[int]*Filter)
			for key, values := range q {
				if !strings.HasPrefix(key, "filters[") {
					continue
				}

				// "filters[0][id]" -> "0][id]"
				inner := strings.TrimPrefix(key, "filters[")
				parts := strings.SplitN(inner, "][", 2)
				if len(parts) != 2 {
					continue
				}

				indexStr := parts[0]                          // "0"
				fieldRaw := strings.TrimSuffix(parts[1], "]") // e.g. "id", "value", or "value][0"
				// Support nested value indexes like value[0], value[1], ...
				field := fieldRaw
				if before, _, ok := strings.Cut(fieldRaw, "]["); ok {
					field = before // "value][0" -> "value"
				}

				idx, err := strconv.Atoi(indexStr)
				if err != nil || idx < 0 {
					continue
				}

				if len(values) == 0 {
					continue
				}
				value := values[0]

				entry, ok := filterMap[idx]
				if !ok {
					entry = &Filter{}
					filterMap[idx] = entry
				}

				switch field {
				case "id":
					entry.ID = value
				case "value":
					// For advanced filters we treat repeated value keys as
					// multi-select. Always append to Values and also keep
					// the latest as Value for convenience.
					entry.Values = append(entry.Values, value)
					entry.Value = value
				case "variant":
					entry.Variant = value
				case "operator":
					entry.Operator = value
				case "filterId":
					entry.FilterID = value
				}
			}

			if len(filterMap) > 0 {
				indices := make([]int, 0, len(filterMap))
				for idx := range filterMap {
					indices = append(indices, idx)
				}
				// insertion sort
				for i := 1; i < len(indices); i++ {
					j := i
					for j > 0 && indices[j-1] > indices[j] {
						indices[j-1], indices[j] = indices[j], indices[j-1]
						j--
					}
				}

				for _, idx := range indices {
					f := filterMap[idx]
					if f == nil || f.ID == "" {
						continue
					}
					// only keep filters for declared columns; keep all other
					// parameters (Value, Values, Operator, Variant, FilterID)
					// exactly as they came from the URL.
					if _, ok := validColumns[f.ID]; ok {
						result.Filters = append(result.Filters, *f)
					}
				}
			}

			// Join operator for combining filters, e.g. "and" / "or".
			if join := q.Get("joinOperator"); join != "" {
				result.JoinOperator = join
			}
		} else {
			// 2) Simple columnFilters: columnFilters[0][id], columnFilters[0][value][0], ...
			filterMap := make(map[int]*Filter)
			for key, values := range q {
				if !strings.HasPrefix(key, "columnFilters[") {
					continue
				}

				// "columnFilters[0][id]"      -> ["0","id"]
				// "columnFilters[1][value][0]" -> ["1","value","0]"]
				inner := strings.TrimPrefix(key, "columnFilters[")
				parts := strings.Split(inner, "][")
				if len(parts) < 2 {
					continue
				}

				indexStr := parts[0] // "0"
				field := parts[1]    // "id" or "value" (possibly "value" with extra index part)
				field = strings.TrimSuffix(field, "]")

				idx, err := strconv.Atoi(indexStr)
				if err != nil || idx < 0 {
					continue
				}

				if len(values) == 0 {
					continue
				}
				value := values[0]

				entry, ok := filterMap[idx]
				if !ok {
					entry = &Filter{}
					filterMap[idx] = entry
				}

				switch field {
				case "id":
					entry.ID = value
				case "value":
					// multi-select values, accumulate
					entry.Values = append(entry.Values, value)
				case "variant":
					entry.Variant = value
				}
			}

			if len(filterMap) > 0 {
				indices := make([]int, 0, len(filterMap))
				for idx := range filterMap {
					indices = append(indices, idx)
				}
				// insertion sort
				for i := 1; i < len(indices); i++ {
					j := i
					for j > 0 && indices[j-1] > indices[j] {
						indices[j-1], indices[j] = indices[j], indices[j-1]
						j--
					}
				}

				for _, idx := range indices {
					f := filterMap[idx]
					if f == nil || f.ID == "" || len(f.Values) == 0 {
						continue
					}
					// only keep filters for declared columns
					if _, ok := validColumns[f.ID]; !ok {
						continue
					}
					// for convenience, set Value to first entry
					if f.Value == "" {
						f.Value = f.Values[0]
					}
					result.Filters = append(result.Filters, *f)
				}
			}
		}
	}

	return result, nil
}
