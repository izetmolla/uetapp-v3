# Flowtrove DataTable reference

## Import paths

```ts
// Main entry
import {
  DataTable,
  useBackendColumns,
  useDataTable,
  useServerTableData,
  convertBackendColumns,
  serializeServerTableParams,
} from "@workspace/flowtrove/components/datatable";

// Subcomponents (composition)
import { DataTableColumnHeader } from "@workspace/flowtrove/components/datatable/components/data-table-column-header";
import { DataTableActionBar } from "@workspace/flowtrove/components/datatable/components/data-table-action-bar";

// Types
import type {
  ServerTableState,
  BackendColumnsResponse,
  DataTableRowAction,
} from "@workspace/flowtrove/components/datatable";
```

---

## `DataTable` props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `columns` | `ColumnDef<T>[]` | required | From `useBackendColumns` or manual |
| `source` | `server` \| `client` | required | See below |
| `initialState` | partial `TableState` | — | `sorting`, `columnVisibility`, `columnPinning` |
| `getRowId` | `(row) => string` | — | Preferred for selection keys |
| `rowIdKey` | keyof T \| string | — | Fallback if no `getRowId` |
| `enableToolbar` | boolean | false | Simple or advanced toolbar |
| `enableAdvancedFilter` | boolean | false | Shows mode toggle + advanced UI |
| `enablePagination` | boolean | true | `DataTablePagination` |
| `enableRowSelection` | boolean | false | Prepends checkbox column |
| `disableParamPersistence` | boolean | false | Local state only |
| `fillHeight` | boolean | false | Flex + overlay states |
| `stickyHeader` | boolean | false | Sticky thead |
| `showTotalRows` | boolean | false | Server total beside page size |
| `actionBar` | node \| `(table) => node` | — | When rows selected |
| `onSelectionChange` | `(rows: T[]) => void` | — | Selected originals |
| `className` | string | — | Root wrapper |

### `source: server`

```ts
{
  type: "server";
  options: {
    fetch: (params: unknown) => Promise<{ data: T[]; pagination: ServerPaginationMeta }>;
    queryKey: string[] | ((params: unknown) => unknown[]);
    initialPerPage?: number;
    enableAdvancedFilter?: boolean; // set by DataTable
    enabled?: boolean;
  };
}
```

### `source: client`

```ts
{
  type: "client";
  data: T[];
}
```

---

## URL query keys (`QUERY_KEYS`)

| Key | nuqs parser | Example |
|-----|-------------|---------|
| `page` | integer | `?page=2` |
| `perPage` | integer | `?perPage=25` |
| `sort` | JSON via `getSortingStateParser` | `?sort=[{"id":"name","desc":true}]` |
| `<columnId>` | string or comma-array | `?status=active,pending` |
| `filters` | JSON advanced tree | `?filters=[...]` |
| `joinOperator` | `and` \| `or` | `?joinOperator=or` |
| `filterFlag` | `advancedFilters` | Activates advanced mode |

Multi-select simple filters: values joined with `ARRAY_SEPARATOR` (`,`).

---

## `serializeServerTableParams` output

Input: `ServerTableState`. Output: flat `Record<string, string>` for HTTP GET.

| Input | Output key(s) |
|-------|----------------|
| `pagination.page` | `pagination[page]` |
| `pagination.perPage` | `pagination[perPage]` |
| `sorting[]` | `sorting` = JSON |
| `columnFilters[]` | `columnFilters` = JSON (+ default operators) |
| `filters[]` + `joinOperator` | `filters`, `filterFlag=advancedFilters`, `joinOperator` |

### Simple filter JSON shape

```json
[{ "id": "full_name", "value": "john", "variant": "text", "operator": "iLike" }]
```

Multi-value:

```json
[{ "id": "status", "values": ["a","b"], "variant": "multiSelect", "operator": "inArray" }]
```

### Advanced filter entry

```ts
// Condition
{ id, variant, operator, value?, values?, joinOperator?, filterId? }

// Group
{ type: "group", groupId, joinOperator?, filters: FilterItemSchema[] }
```

`filterId` / `groupId` are UI-only — stripped during serialization.

---

## `useBackendColumns` options

| Option | Type | Purpose |
|--------|------|---------|
| `fetchColumns` | `(filters?) => Promise<{ columns, columnVisibility? }>` | GET columns API |
| `queryKey` | `unknown[]` | React Query prefix |
| `prependColumns` | `ColumnDef[]` | Before backend cols |
| `appendColumns` | `ColumnDef[]` | After (e.g. actions) |
| `overrideColumns` | `Array<{ id } & Partial<ColumnDef>>` | Merge by id |
| `enabled` | boolean | Default true |

Returns: `{ columns, isLoading, isError, error, refetch, columnVisibility }`.

### `filterBy` refetch

1. Base query: `queryKey + "__base"`
2. If any column has `meta.filterBy`, subscribe to that column's URL filter
3. When active: `queryKey + "__dep" + signature` refetch with `filters` arg

---

## `ColumnMeta` (TanStack)

| Field | Backend JSON | Effect |
|-------|--------------|--------|
| `label` | `meta.label` | Filter label |
| `variant` | `meta.variant` | Control type (required to filter) |
| `placeholder` | `meta.placeholder` | Text input |
| `options` | `meta.options` | Select/multiSelect |
| `enableOnlyAdvancedFilters` | `enableOnlyAdvancedFilters` | Hide from simple toolbar |
| `hidden` | `meta.hidden` | Hide filter chip in toolbar |
| `disabled` | `meta.disabled` | Read-only filter input |
| `filterBy` | `meta.filterBy` | Parent column id for options |
| `className` | — | Cell/header CSS |

---

## Filter variants → operators (`config/data-table.ts`)

| variant | Default operator (simple) | Available (advanced) |
|---------|---------------------------|-------------------------|
| `text` | `iLike` | textOperators |
| `number` | `eq` | numericOperators |
| `range` | `eq` | numericOperators |
| `date` | `eq` | dateOperators |
| `dateRange` | `eq` | dateOperators |
| `boolean` | `eq` | booleanOperators |
| `select` | `inArray` (via serialize) | selectOperators |
| `multiSelect` | `inArray` | multiSelectOperators |

---

## `DataTableRowAction`

```ts
{ row: Row<T>; variant: "quickEdit" | "design" | "view" | "delete" | "disable" | "enable" }
```

---

## Pagination (`ServerPaginationMeta`)

```ts
{
  pageCount: number;  // required — TanStack page count
  total?: number;
  page?: number;
  perPage?: number;
}
```

Go backend often returns `total_pages`, `limit` — map in custom `fetch` if needed.

---

## Local state (`disableParamPersistence`)

`DataTableLocalState` fields: `page`, `perPage`, `sorting`, `filterValues`, `advancedFilters`, `joinOperator`, `filterFlag`, plus setters and `clear*` helpers.

Access in custom code: `useOptionalDataTableLocalState()` (returns null when URL mode).

---

## Hooks summary

| Hook | Responsibility |
|------|----------------|
| `useDataTable` | TanStack instance + URL/local pagination, sort, simple filters |
| `useServerTableData` | Build state → serialize → React Query → `data`/`pagination` |
| `useAdvancedFiltersQueryState` | Parse/restore advanced `filters` URL JSON |
| `useBackendColumns` | Columns API + convert + merge |
| `useDebouncedCallback` | Filter input debounce (300ms default) |

---

## Exported subcomponents

| Component | Use |
|-----------|-----|
| `DataTableContent` | Table markup only |
| `DataTableToolbar` | Simple filters |
| `DataTableAdvancedToolbar` | Advanced layout shell |
| `DataTableFilterList` | Advanced filter builder |
| `DataTableSortList` | Multi-sort UI |
| `DataTablePagination` | Page controls |
| `DataTableColumnHeader` | Sortable header |
| `DataTableSkeleton` | Loading placeholder |
| `DataTableAdvancedOptions` | Simple/advanced toggle |
| `DataTableAdvancedResetButton` | Clear advanced state |

---

## Utilities

| Function | Purpose |
|----------|---------|
| `convertBackendColumns` | `BackendColumnDefinition[]` → `ColumnDef[]` |
| `serializeServerTableParams` | State → query params |
| `getValidFilters` | Strip empty simple filters |
| `getValidAdvancedFilterEntries` | Strip invalid advanced entries |
| `hasValidFilterVariant` | Guard filter rendering |
| `getFilterOperators(variant)` | Operator dropdown options |
| `formatDate` | `lib/format.ts` for cells |

---

## Backend JSON column (Go alignment)

```ts
interface BackendColumnDefinition {
  id: string;
  accessorKey: string;
  header: string;
  enableSorting?: boolean;
  enableColumnFilter?: boolean;
  enableOnlyAdvancedFilters?: boolean;
  size?: number;
  meta?: BackendColumnMeta;
}
```

`columnVisibility` in response: `{ [columnId]: boolean }` — `false` when backend `hidden: true`.

---

## Tests to run when changing contract

```bash
pnpm exec vitest run packages/flowtrove/src/components/datatable/lib/serialize-server-table-params.test.ts
pnpm exec vitest run packages/flowtrove/src/components/datatable/lib/filter-groups-contract.test.ts
cd backends/packages/datatable && go test ./...
```
