# DataTable examples

## Server-side (production patterns)

### 1. Standard list — resources

`apps/app/src/pages/cadmin/pages/resources/pages/list/`

```tsx
const { columns, isLoading, error, columnVisibility } = useBackendColumns<Resource>({
  fetchColumns: () => getResourcesColumns(),
  queryKey: [RESOURCES_FETCH_KEY, "columns"],
  appendColumns: getActionsColumn(setRowAction),
  overrideColumns: prependColumns(),
});

<DataTable<Resource>
  columns={columns}
  source={{
    type: "server",
    options: {
      fetch: (params) => getResourcesList(params),
      queryKey: (params) => [RESOURCES_FETCH_KEY, "list", params],
      initialPerPage: 10,
    },
  }}
  initialState={{
    sorting: [{ id: "created_at", desc: true }],
    columnPinning: { right: ["actions"] },
    columnVisibility,
  }}
  getRowId={(r) => r.id}
  enableToolbar
  enableAdvancedFilter
  enablePagination
  enableRowSelection
/>
```

### 2. Org units — action bar + row selection

`apps/app/src/pages/cadmin/pages/orgunits/pages/list/`

```tsx
<DataTable<OrgUnit>
  ...
  enableRowSelection
  actionBar={(table) => <OrgUnitsTableActionBar table={table} />}
/>
```

### 3. Users — store actions + column overrides + stats

`apps/app/src/pages/cadmin/pages/users/pages/list/`

```tsx
useBackendColumns<User>({
  fetchColumns: () => getUsersColumns(),
  queryKey: [USER_FETCH_PERSISTANT, "columns"],
  appendColumns: getActionsColumn(),       // uses Zustand store
  overrideColumns: getColumnOverrides(), // avatar, roles, status badges
});

<>
  <StatsCard />
  <DataTable<User> ... actionBar={(t) => <UsersTableActionBar table={t} />} />
</>
```

### 4. Secretary students — custom fetch + templates

`apps/app/src/pages/secretary/pages/suplements/pages/student1/`

See [advanced-server.md](advanced-server.md) §1.

### 5. Account sessions — fetch side-effect

`apps/app/src/pages/account/pages/pages/sessions/`

```tsx
const fetchSessions = useMemo(
  () => async (params: unknown) => {
    const body = await getSessionsList(params);
    setCurrentSessionId(body.current_session_id);
    return body;
  },
  [],
);

useBackendColumns({
  overrideColumns: prependSessionColumns(currentSessionId),
});
```

### 6. Contracts students

`apps/app/src/pages/contracts/pages/students/pages/list/`

Same as standard + `StatsCard` + sync dialog invalidating `[STUDENTS_FETCH_PERSISTANT, "students"]`.

---

## api/index.ts template

```ts
import type { BackendColumnsResponse } from "@workspace/flowtrove/components/datatable";
import ApiService, { type ResponseWithPagination, withAPI } from "@workspace/flowtrove/lib/network";

const base = "/cadmin/foo/list";

export async function getFooList(params: unknown) {
  return ApiService.fetchData<ResponseWithPagination<Foo>>({
    url: withAPI(base),
    method: "get",
    params,
  });
}

export async function getFooColumns(filters?: Record<string, string>) {
  return ApiService.fetchData<BackendColumnsResponse>({
    url: withAPI(`${base}/columns`),
    method: "get",
    params: filters,
  });
}
```

---

## table-columns.tsx template

```tsx
import type { ColumnDef } from "@tanstack/react-table";
import type { DataTableRowAction } from "@workspace/flowtrove/components/datatable/types/data-table";

export function getActionsColumn(
  setRowAction: React.Dispatch<React.SetStateAction<DataTableRowAction<Foo> | null>>,
): ColumnDef<Foo>[] {
  return [{
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuItem onClick={() => setRowAction({ row, variant: "quickEdit" })}>
          Edit
        </DropdownMenuItem>
      </DropdownMenuItem>
    ),
    size: 40,
  }];
}

export function getColumnOverrides(): Array<{ id: string } & Partial<ColumnDef<Foo>>> {
  return [{ id: "name", cell: ({ row }) => <strong>{row.original.name}</strong> }];
}
```

---

## Client-side examples

No app page yet — copy from [advanced-client.md](advanced-client.md):

| Example | Section |
|---------|---------|
| Basic in-memory table | § Basic client table |
| Dialog picker | § Client table in a dialog |
| Row selection export | § Client with row selection |
| Columns from API, data local | § Hybrid |

---

## Debug serialized params

```ts
import { serializeServerTableParams } from "@workspace/flowtrove/components/datatable/lib/serialize-server-table-params";

console.log(serializeServerTableParams({
  pagination: { page: 1, perPage: 10 },
  sorting: [{ id: "created_at", desc: true }],
  columnFilters: [{ id: "email", value: "@edu.al", variant: "text" }],
}));
```

Compare query string with Go `ExtractQuery` tests.

---

## Invalidate queries after mutation

```ts
void queryClient.invalidateQueries({ queryKey: [PAGE_KEY, "list"] });
void queryClient.invalidateQueries({ queryKey: [PAGE_KEY, "columns"] });
void queryClient.invalidateQueries({ queryKey: [PAGE_KEY, "stats"] });
```
