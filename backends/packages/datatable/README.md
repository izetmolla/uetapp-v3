## Datatable backend helpers

This package contains backend helpers for datatable components in the frontend (TanStack Table–aligned). It provides:

- **Column** / **ColumnMeta** / **OptionItem** – column configuration returned to the frontend
- **Pagination** / **RenderPagination** – pagination metadata
- **TableQuery** / **ExtractQuery** – parsing of query parameters from `Fiber.Ctx.OriginalURL()`
- **Bool(b bool)** – helper for `DefaultVisible` (e.g. hidden columns)

### Column (TanStack Table–aligned)

| Field | Description |
|-------|-------------|
| `ID` | Stable column id (sorting/filtering state, key). |
| `SQLColumn` | DB expression for SELECT (e.g. `CONCAT(first_name, ' ', last_name)`). Omit to use `ID`/`AccessorKey`. |
| `AccessorKey` | Key to access row data (TanStack `accessorKey`). |
| `Header` | Visible column header. |
| `Footer` | Optional footer. |
| `EnableSorting` | Column can be used in sort state. |
| `EnableColumnFilter` | Column can be used in column filters. |
| `EnableHiding` | Column can be toggled in column visibility UI. |
| `DefaultVisible` | `*bool`: if `Bool(false)`, column is hidden by default (not rendered). Omit so frontend defaults to visible. |
| `Size` / `MinSize` / `MaxSize` | Column sizing. |
| `Pinned` | `"left"` \| `"right"` \| `""`. |
| `Meta` | Label, variant, placeholder, options for filters. |

### `TableQuery`

`TableQuery` is the normalized representation of the datatable request on the backend:

- `Page`, `PageSize` – current page and page size
- `Sorts []Sort` – ordered list of sort instructions `{ ID, Desc }`
- `Filters []Filter` – list of filter conditions
- `JoinOperator` – how to combine filters in advanced mode (`"and"` / `"or"`)

All values are derived from the request URL so the backend code does not need to know the exact client-side parameter names.

### `ExtractQuery`

```go
func ExtractQuery(rawURL string, columns []Column) (TableQuery, error)
```

`ExtractQuery` parses a full URL string (usually `c.OriginalURL()` from Fiber) and returns a `TableQuery`.  
It uses the provided `columns` to validate which column IDs / accessor keys are allowed for sorting and filtering.

#### Pagination

Two styles are supported:

- Simple:
  - `page=<number>`
  - `pageSize=<number>`
- Object-style:
  - `pagination[page]=1`
  - `pagination[perPage]=10`

Both map into `TableQuery.Page` and `TableQuery.PageSize`.

#### Sorting

Sorting is always normalized into `TableQuery.Sorts` (multi-sort, with precedence defined by index).

Supported formats:

- **Indexed keys** (used by the current frontend):
  - `sorting[0][id]=department`
  - `sorting[0][desc]=true`
  - `sorting[1][id]=status`
  - `sorting[1][desc]=false`
- **JSON** (not required by this project, but supported):
  - `sorting=[{"id":"name","desc":true}, ...]`
- **Legacy single column**:
  - `sortBy=name`
  - `sortDir=asc|desc`

Any sort whose `id` is not present in the supplied `columns` (either `ID` or `AccessorKey`) is ignored.

#### Filtering – two modes controlled by `filterFlag`

There are **two separate filter modes**, chosen by the `filterFlag` query parameter:

1. **Advanced mode** – `filterFlag=advancedFilters`
2. **Simple mode** – default, when `filterFlag` is anything else or missing

In both modes, only filters whose `ID` matches one of the supplied `columns` are kept.

##### 1. Advanced filters (`filterFlag=advancedFilters`)

Used by the "advanced filters" builder in the frontend.

- URL shape (indexed `filters[...]` and `joinOperator`):

  - `filters[0][id]=name`
  - `filters[0][value]=user`
  - `filters[0][variant]=text`
  - `filters[0][operator]=iLike`
  - `filters[0][filterId]=abc123`
  - `filters[4][id]=department`
  - `filters[4][value][0]=customer_support`
  - `filters[4][value][1]=legal`
  - `filters[4][variant]=multiSelect`
  - `filters[4][operator]=inArray`
  - `filters[4][filterId]=XYZ`
  - `joinOperator=and`

- Normalization into `Filter`:

  - `ID` – from `filters[i][id]`
  - `Value` – last scalar or last of the `value[...]` entries (for convenience)
  - `Values []string` – all `value` / `value[n]` values (for multi-select)
  - `Variant` – from `filters[i][variant]` (e.g. `text`, `select`, `multiSelect`)
  - `Operator` – from `filters[i][operator]` (e.g. `iLike`, `eq`, `inArray`, `isNotEmpty`)
  - `FilterID` – from `filters[i][filterId]`

- `JoinOperator` is set from the `joinOperator` query param and is intended to be used when building the final `WHERE` clause (e.g. combine all filters with `AND` or `OR`).

##### 2. Simple filters (default, `columnFilters[...]`)

Used by the basic per-column filter UI in the frontend.

- URL shape:

  - `columnFilters[0][id]=name`
  - `columnFilters[0][value]=john`
  - `columnFilters[1][id]=status`
  - `columnFilters[1][value][0]=active`
  - `columnFilters[2][id]=department`
  - `columnFilters[2][value][0]=marketing`
  - `columnFilters[2][value][1]=hr`
  - `columnFilters[2][value][2]=sales`

- Normalization into `Filter`:

  - `ID` – from `columnFilters[i][id]`
  - `Values []string` – all `value` / `value[n]` values (for multi-select)
  - `Value` – first entry from `Values` (for convenience)

`Variant`, `Operator`, and `FilterID` are unused in simple mode and left empty.

### Usage example

In a Fiber handler (e.g. `GetUsersList`):

```go
columns, err := cc.getUsersColumns()
if err != nil {
    // handle error
}

q, err := datatable.ExtractQuery(c.OriginalURL(), columns)
if err != nil {
    // handle error
}

// q.Page, q.PageSize  -> pagination
// q.Sorts             -> ORDER BY clauses
// q.Filters           -> WHERE conditions (respecting q.JoinOperator in advanced mode)
```

With this abstraction, the handler can remain stable even if the frontend adds more filter types, as long as they follow one of the two supported URL patterns.

---

## Examples

### Full handler: list with query parsing and PostgreSQL

```go
func (cc *controller) GetUsersList(c fiber.Ctx) error {
	db, _ := cc.drivers.DB()
	columns, _ := cc.getUsersColumns()

	q, err := datatable.ExtractQuery(c.OriginalURL(), columns)
	if err != nil {
		return cc.drivers.HandleApiError(c, fiber.StatusBadRequest, err, "BAD_REQUEST")
	}

	users, pagination, err := postgresql.Find[models.User](db.Model(&models.User{}), q, columns)
	if err != nil {
		return cc.drivers.HandleApiError(c, fiber.StatusInternalServerError, err, "INTERNAL_SERVER_ERROR")
	}

	return c.JSON(fiber.Map{
		"data":       users,
		"pagination": datatable.RenderPagination(pagination),
	})
}
```

### Defining columns (visible in the table)

```go
func getUsersColumns() ([]datatable.Column, error) {
	return []datatable.Column{
		{
			ID:                 "name",
			SQLColumn:          "CONCAT(first_name, ' ', last_name)",
			AccessorKey:        "name",
			Header:             "Name",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Name",
				Variant:     "text",
				Placeholder: "Search user...",
			},
		},
		{
			ID:                 "email",
			AccessorKey:        "email",
			Header:             "Email",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{ Label: "Email", Variant: "text" },
		},
	}, nil
}
```

### Column that is not rendered on the table (hidden by default)

Use when you need a column for row keys, filtering, or exports but don’t want it shown in the grid by default. Set `DefaultVisible: datatable.Bool(false)` and optionally `EnableHiding: true` so the user can show it from the column visibility UI.

```go
// ID column: used as row key and for APIs, hidden by default
idColumn := datatable.Column{
	ID:                 "id",
	AccessorKey:        "id",
	Header:             "ID",
	EnableSorting:      true,
	EnableColumnFilter: false,
	EnableHiding:       true,
	DefaultVisible:     datatable.Bool(false), // not rendered until user shows it
}

// Internal ref: only for exports/row actions, never shown in table
internalRef := datatable.Column{
	ID:                 "internal_ref",
	SQLColumn:          "internal_ref",
	AccessorKey:        "internalRef",
	Header:             "Ref",
	EnableSorting:      false,
	EnableColumnFilter: false,
	EnableHiding:       true,
	DefaultVisible:     datatable.Bool(false),
}

// Prepend or append to your columns slice
columns := append([]datatable.Column{idColumn}, visibleColumns...)
```

### Raw SQL list with optional joins

```go
users, pagination, err := postgresql.FindRaw[map[string]any](db, q, columns, "users").
	AddJoin("LEFT JOIN departments ON users.department_id = departments.id").
	AddJoin("LEFT JOIN roles ON users.role_id = roles.id").
	Run()
```

### Operators and building a PostgreSQL WHERE clause

The `operators` helpers match the frontend `dataTableConfig` (text, numeric, date, select, multiSelect, boolean operators and join operators).

**Constants (for reference or validation):**

```go
// Operator values
datatable.OpILike       // "iLike"
datatable.OpNotILike    // "notILike"
datatable.OpEq          // "eq"
datatable.OpNe          // "ne"
datatable.OpInArray     // "inArray"
datatable.OpNotInArray  // "notInArray"
datatable.OpIsEmpty     // "isEmpty"
datatable.OpIsNotEmpty  // "isNotEmpty"
datatable.OpLt          // "lt"
datatable.OpLte         // "lte"
datatable.OpGt          // "gt"
datatable.OpGte         // "gte"
datatable.OpIsBetween   // "isBetween"
datatable.OpIsRelativeToToday

// Join
datatable.JoinAnd       // "and"
datatable.JoinOr        // "or"

datatable.AllOperators   // []string of all operator values
datatable.JoinOperators  // []string{"and", "or"}
```

**Build the WHERE fragment from `TableQuery.Filters` and `JoinOperator`:**

```go
columns, _ := cc.getUsersColumns()
q, _ := datatable.ExtractQuery(c.OriginalURL(), columns)

// Map filter ID → DB column name (uses AccessorKey or ID from columns)
columnNameByID := datatable.ColumnNameByID(columns)

// PostgreSQL fragment after WHERE, and args for placeholders
where, args := datatable.ConditionsFromFilters(q.Filters, q.JoinOperator, columnNameByID)
// e.g. where = "(full_name ILIKE ?) AND (email <> ?) AND (department IN (?,?,?,?))"
//      args = []any{"%izet%", "icloud.com", "it", "marketing", "sales", "hr"}
```

**Use with Gorm:**

```go
if where != "" {
	db = db.Where(where, args...)
}
var users []models.User
db.Find(&users)
```

**Use with raw SQL:**

```go
sql := "SELECT * FROM users"
if where != "" {
	sql += " WHERE " + where
}
db.Raw(sql, args...).Scan(&results)
```

