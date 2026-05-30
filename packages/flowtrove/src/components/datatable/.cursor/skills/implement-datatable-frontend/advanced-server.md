# Advanced server-side DataTable

Patterns taken from production `apps/app` pages.

---

## 1. Custom `fetch` wrapper

When the API returns extra fields or pagination shape differs from `ServerPaginationMeta`.

**Reference:** `apps/app/src/pages/secretary/pages/suplements/pages/student1/index.tsx`

```tsx
source={{
  type: "server",
  options: {
    fetch: async (params) => {
      const body = await getStudentsList(params);
      // Side data from same response
      if (body?.templates?.length) setTemplates(body.templates);

      const p = body?.pagination;
      return {
        data: body?.data ?? [],
        pagination: {
          pageCount: p?.total_pages ?? Number(p?.pageCount ?? 0),
          total: p?.total,
          page: p?.page,
          perPage: p?.limit ?? p?.perPage,
        },
      };
    },
    queryKey: (params) => [STUDENTS_FETCH_KEY, "list", params],
    initialPerPage: 10,
  },
}}
```

`useServerTableData` only needs `{ data, pagination.pageCount }`; map Go `total_pages` / `limit` here.

---

## 2. Fetch side-effect (session context)

Update parent state from list response without extra request.

**Reference:** `apps/app/src/pages/account/pages/pages/sessions/index.tsx`

```tsx
const [currentSessionId, setCurrentSessionId] = useState<string>();

const fetchSessions = useMemo(
  () => async (params: unknown) => {
    const body = await getSessionsList(params);
    setCurrentSessionId(body.current_session_id);
    return body; // still { data, pagination }
  },
  [],
);

// overrideColumns uses currentSessionId for "This device" badge
overrideColumns: prependSessionColumns(currentSessionId),
```

---

## 3. Dependent column options (`meta.filterBy`)

Backend column declares `meta.filterBy: "study_level"`. Frontend refetches columns when that URL filter changes.

**API:**

```ts
export async function getStudentsColumns(filters?: Record<string, string>) {
  return ApiService.fetchData({
    url: withAPI("/.../columns"),
    params: filters, // { study_level: "master,bachelor" }
  });
}
```

**Page:**

```tsx
useBackendColumns<Student>({
  fetchColumns: (filters) => getStudentsColumns(filters),
  queryKey: [KEY, "columns"],
});
```

`useBackendColumns` runs a base fetch, discovers `filterBy` keys, then refetches with `__dep` query key when parent filters are active.

---

## 4. Rich `overrideColumns`

Replace default `convertBackendColumns` cells (avatar, links, badges).

**Reference:** `apps/app/src/pages/cadmin/pages/users/pages/list/components/table-columns.tsx`

```tsx
export function getColumnOverrides(): Array<{ id: string } & Partial<ColumnDef<User>>> {
  return [
    {
      id: "full_name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar>...</Avatar>
          <LongText>{row.getValue("full_name")}</LongText>
        </div>
      ),
    },
    {
      id: "roles",
      cell: ({ row }) => <UserRolesCell roles={row.original.roles} />,
    },
    {
      id: "status",
      cell: ({ row }) => <Badge>{row.original.status}</Badge>,
    },
  ];
}
```

Merge is shallow on `meta`; spread carefully when overriding `meta`.

---

## 5. Row actions: callback vs global store

**Pattern A — `setRowAction` state** (resources, orgunits):

```tsx
const [rowAction, setRowAction] = useState<DataTableRowAction<T> | null>(null);
appendColumns: getActionsColumn(setRowAction),
// useEffect on rowAction.variant → open dialogs
```

**Pattern B — Zustand store** (users):

```tsx
appendColumns: getActionsColumn(), // reads useUsersListStore inside cell
// openQuickEdit(row), openDelete(row) — no rowAction prop
```

Both valid; store scales when many dialogs share state.

---

## 6. Action bar + bulk selection

```tsx
<DataTable
  enableRowSelection
  actionBar={(table) => <UsersTableActionBar table={table} />}
/>
```

Action bar components use:

```tsx
import {
  DataTableActionBar,
  DataTableActionBarSelection,
  DataTableActionBarAction,
} from "@workspace/flowtrove/components/datatable/components/data-table-action-bar";

const rows = table.getFilteredSelectedRowModel().rows;
const ids = rows.map((r) => r.original.id);
```

Pass dynamic data into action bar via closure (e.g. `templates` from custom fetch in secretary page).

---

## 7. Stats / KPI row (separate query)

Not part of DataTable — parallel `useQuery` above the table.

**Reference:** `users/list/components/stats-card.tsx`, `contracts/students/list`

```tsx
const LIST_KEY = "usersPage";

<>
  <StatsCard />  {/* queryKey: [LIST_KEY, "stats"] */}
  <DataTable ... queryKey: (s) => [LIST_KEY, "users", s] />
</>
```

Invalidate stats separately after mutations if counts change.

---

## 8. `showTotalRows`

```tsx
<DataTable
  showTotalRows
  // server mode: total from pagination.total inside DataTable
/>
```

Shows total count beside page size selector (uses `serverData.pagination.total`).

---

## 9. Layout: fullscreen / sticky header

```tsx
<DataTable
  fillHeight        // flex child; centered loading/empty overlay
  stickyHeader      // fixed header while scrolling
/>
```

Use in dialogs or full-viewport layouts.

---

## 10. Advanced filter groups

Users build conditions in `DataTableFilterList`; URL stores nested JSON:

```json
[
  { "id": "status", "variant": "multiSelect", "operator": "inArray", "values": ["active"] },
  {
    "type": "group",
    "joinOperator": "or",
    "filters": [
      { "id": "full_name", "variant": "text", "operator": "iLike", "value": "izet" },
      { "id": "roles", "variant": "multiSelect", "operator": "inArray", "values": ["admin"] }
    ]
  }
]
```

Go `ConditionsFromFilters` handles `type: "group"`. Test changes with `filter-groups-contract.test.ts`.

---

## 11. `enableOnlyAdvancedFilters` columns

Backend: `enableOnlyAdvancedFilters: true`, often `hidden: true` for extra searchable fields.

- Excluded from simple toolbar (`DataTableToolbar`)
- Still available in advanced filter column picker
- Must still have `meta.variant`

---

## 12. Query invalidation

```ts
const listQueryKey = [PAGE_KEY, "list"] as const;

// After mutation:
void queryClient.invalidateQueries({ queryKey: listQueryKey });
// Prefix match invalidates all param variants

void queryClient.invalidateQueries({ queryKey: [PAGE_KEY, "columns"] });
// If mutation changes filter options
```

---

## 13. Pagination response mapping

Go `RenderPagination` returns:

```json
{ "page", "limit", "total", "total_pages", "pageCount" }
```

Frontend `useServerTableData` reads `pagination.pageCount` for TanStack `pageCount`. Map aliases in custom `fetch` if API uses snake_case only.

---

## 14. Hand-written columns + server data

Skip `useBackendColumns` only if columns are fully static:

```tsx
const columns: ColumnDef<Foo>[] = [ /* with meta.variant */ ];
<DataTable columns={columns} source={{ type: "server", options: { fetch, queryKey } }} />
```

Prefer backend-driven columns when filters/sorts are dynamic.
