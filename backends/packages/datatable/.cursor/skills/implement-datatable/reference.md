# Datatable reference

## TableQuery (after Extract)

| Field | Meaning |
|-------|---------|
| `Page` | 1-based page index |
| `PageSize` | Rows per page (default 10) |
| `Sorts` | `{ ID, Desc }[]` — precedence = slice order |
| `Filters` | Normalized filters (simple or advanced) |
| `JoinOperator` | `"and"` \| `"or"` — combines top-level advanced filters |
| `Search` | Global search from `search` or `q` (optional; app may ignore) |

## Query parameters (frontend → backend)

### Pagination

| Param | Maps to |
|-------|---------|
| `page`, `pageSize` | `Page`, `PageSize` |
| `pagination[page]`, `pagination[perPage]` or `pagination[pageSize]` | same |
| `pagination={"pageIndex":0,"pageSize":10}` JSON | pageIndex+1, pageSize |

### Sorting

| Param | Format |
|-------|--------|
| `sorting` | JSON `[{"id":"name","desc":true}]` (**primary**) |
| `sorting[0][id]`, `sorting[0][desc]` | Indexed bracket form |
| `sortBy`, `sortDir` | Legacy single sort |

### Filtering modes

| Mode | Trigger | Param shape |
|------|---------|-------------|
| Simple | default | `columnFilters` JSON or `columnFilters[i][id]`, `[value]` |
| Advanced | `filterFlag=advancedFilters` or `filters[...]` | `filters` JSON or `filters[i][id|value|variant|operator|filterId]`, plus `joinOperator` |

Nested groups (advanced): filter entries with `type: "group"` and nested `filters` array.

### Filter struct

| Field | Simple | Advanced |
|-------|--------|----------|
| `ID` | column id | column id |
| `Value` | first value | last scalar |
| `Values` | all values | multi-select |
| `Variant` | often from column meta enrichment | `text`, `multiSelect`, … |
| `Operator` | often empty (inferred) | `iLike`, `inArray`, … |
| `JoinOperator` | per-filter combine | per-filter combine |

## Column struct (JSON to frontend)

| Field | Purpose |
|-------|---------|
| `id` | Sort/filter state key (**required**) |
| `accessorKey` | Row JSON key (usually same as id) |
| `sqlColumn` | DB expression for SELECT/ORDER BY |
| `filterSQLColumn` | WHERE expression override |
| `isEmptySQL` / `isNotEmptySQL` | Custom empty checks for expressions |
| `isJSON` | Parse JSON strings in `FormatContent` |
| `header`, `footer` | UI labels |
| `enableSorting`, `enableColumnFilter`, `enableHiding` | Capabilities |
| `enableOnlyAdvancedFilters` | Hide from simple filter bar |
| `hidden` | Hide column in grid (`columnVisibility`) |
| `pinned` | `"left"` \| `"right"` |
| `size`, `minSize`, `maxSize` | Column width |
| `meta` | `label`, `variant`, `placeholder`, `options`, `hidden`, `disabled`, `filterBy` |

### Meta variants (align with frontend)

`text`, `number`, `range`, `date`, `dateRange`, `boolean`, `select`, `multiSelect`

## Operator constants

```go
datatable.OpILike, OpNotILike, OpEq, OpNe
datatable.OpInArray, OpNotInArray
datatable.OpIsEmpty, OpIsNotEmpty
datatable.OpLt, OpLte, OpGt, OpGte
datatable.OpIsBetween, OpIsRelativeToToday
datatable.JoinAnd, JoinOr
```

### Inference (simple mode)

- No operator + 1 value → `eq` (text variant → `iLike`)
- No operator + N values → `inArray`
- `isEmpty` / `isNotEmpty` — unary, ignore values

### Special columns

- `roles` id/accessorKey — JSONB role grants (`inArray` uses EXISTS on jsonb elements)
- `IsJSON` + `multiSelect` — jsonb array contains / empty checks

## SQL helper functions

| Function | Use |
|----------|-----|
| `ExtractQuery(url, columns)` | Parse full URL |
| `ColumnNameByID(columns)` | Sort / ORDER BY mapping |
| `FilterColumnNameByID(columns)` | WHERE mapping (respects FilterSQLColumn) |
| `ConditionsFromFilters(filters, join, columns)` | WHERE with `?` args |
| `ConditionsFromFiltersWithoutargs(...)` | Raw SQL only (FindRaw); trusted inputs |
| `OrderByClause(sorts, columnNameByID)` | ` ORDER BY ...` fragment |
| `NormalizeFilterOperator(f)` | Effective operator string |
| `FilterValues(f)` | All scalar values from filter |
| `GetColumns(columns)` | API payload with `columnVisibility` |
| `FormatContent(&rows, columns)` | Unmarshal JSON columns in place |

## postgresql package

### Find

```go
postgresql.Find[T](db *gorm.DB, q TableQuery, columns []Column) ([]T, Pagination, error)
```

Applies filters → count → limit/offset → find.

### FindRaw

```go
postgresql.FindRaw[T](db, q, columns, table string) *RawQueryBuilder[T]
builder.AddJoin("LEFT JOIN ...").Run()
```

Builds `SELECT {sqlColumns} FROM table [joins] WHERE ... ORDER BY ... LIMIT OFFSET`.

Use `T = map[string]any` for dynamic column sets.

## tablequery (app pkg)

```go
tablequery.Extract(c fiber.Ctx, columns []datatable.Column)
tablequery.GetFilterValue(c, columnID string) string
tablequery.GetFilter(c, columnID string) []string
tablequery.GetPagination(c) datatable.Pagination
```

## API response shapes

**Columns endpoint**

```json
{
  "columns": [ { "id": "...", "accessorKey": "...", "meta": { ... } } ],
  "columnVisibility": { "id": false, "full_name": true }
}
```

**List endpoint**

```json
{
  "data": [ { "full_name": "...", "id": 1 } ],
  "pagination": { "page": 1, "limit": 10, "total": 100, "total_pages": 10, "pageCount": 10 }
}
```

## Frontend contract

Serialization lives in `packages/flowtrove/src/components/datatable/lib/serialize-server-table-params.ts`:

- Pagination → `pagination[page]`, `pagination[perPage]`
- Sorting → `sorting` JSON array
- Simple filters → `columnFilters` JSON (text defaults to `iLike`, multiSelect to `inArray`)
- Advanced → `filterFlag=advancedFilters`, `filters` JSON, `joinOperator`

Backend changes must stay compatible with that serializer.
