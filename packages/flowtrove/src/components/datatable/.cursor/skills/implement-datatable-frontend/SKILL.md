---
name: implement-datatable-frontend
description: >-
  Implements Flowtrove DataTable pages (server or client): useBackendColumns, DataTable,
  serializeServerTableParams, nuqs URL state, advanced filters, action bars, and custom
  fetch. Use for list pages, datatable component changes, or pairing with Go datatable APIs.
---

# Implement Flowtrove DataTable

Choose **server** (production default) or **client** (small/local datasets). Read [architecture.md](architecture.md) first if unfamiliar with URL state or filter modes.

Backend pairing: `backends/packages/datatable/.cursor/skills/implement-datatable/SKILL.md`.

---

## Server-side checklist (most app pages)

```
- [ ] 1. Go: GET .../columns + GET .../list
- [ ] 2. api/index.ts — get*Columns, get*List(params: unknown)
- [ ] 3. table-columns.tsx — getActionsColumn, getColumnOverrides / prependColumns
- [ ] 4. useBackendColumns + DataTable source.type "server"
- [ ] 5. initialState: sorting, columnPinning { right: ["actions"] }, columnVisibility
- [ ] 6. enableToolbar; enableAdvancedFilter if power users need groups/operators
- [ ] 7. queryKey: (state) => [PAGE_KEY, "list", state]  // state = serialized params
- [ ] 8. Mutations: invalidateQueries on list queryKey prefix
- [ ] 9. Optional: stats query, actionBar, custom fetch — see advanced-server.md
```

### Minimal server page

```tsx
const KEY = "fooPage";

const { columns, isLoading, error, columnVisibility } = useBackendColumns<Foo>({
  fetchColumns: () => getFooColumns(),
  queryKey: [KEY, "columns"],
  appendColumns: getActionsColumn(setRowAction),
  overrideColumns: getColumnOverrides(),
});

<ContentLoader isLoading={isLoading} error={error}>
  <DataTable<Foo>
    columns={columns}
    source={{
      type: "server",
      options: {
        fetch: (params) => getFooList(params),
        queryKey: (params) => [KEY, "list", params],
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
  />
</ContentLoader>
```

### API layer

```ts
export async function getFooList(params: unknown) {
  return ApiService.fetchData<ResponseWithPagination<Foo>>({
    url: withAPI("/path/list"),
    method: "get",
    params, // serialized: pagination[page], sorting, columnFilters|filters, ...
  });
}
```

---

## Client-side checklist (no list API)

Use when all rows fit in memory (< few thousand), settings previews, or picker dialogs.

```
- [ ] 1. Load data once (useQuery or props)
- [ ] 2. Define ColumnDef[] with meta.variant for filters
- [ ] 3. DataTable source.type "client" + data={rows}
- [ ] 4. enableToolbar / enablePagination as needed
- [ ] 5. disableParamPersistence if inside modal (recommended)
- [ ] 6. No serializeServerTableParams / no backend list endpoint
```

See [advanced-client.md](advanced-client.md) for full examples.

---

## Decision: server vs client

| Use server | Use client |
|------------|------------|
| Paginated DB lists | < ~500 rows, already in memory |
| Filters hit SQL | Offline / static JSON |
| Backend defines columns | Prototype without API |
| Shareable URL filter state | Embedded picker in dialog |

---

## Filter modes (server)

| Mode | Page props | User control |
|------|------------|--------------|
| Simple | `enableToolbar` | Per-column inputs in toolbar |
| Advanced | `+ enableAdvancedFilter` | Toggle → filter list, AND/OR, groups |

Advanced serializes `filterFlag=advancedFilters` + `filters` JSON — must match Go advanced parser.

---

## Common pitfalls

| Issue | Fix |
|-------|-----|
| List never refetches on filter | `queryKey: (state) => [...]` must include `state` |
| Filters ignored by API | Pass `params` from fetch directly; do not rebuild manually |
| Column not filterable | Backend `meta.variant` + `enableColumnFilter` |
| Hidden id column visible | Pass `columnVisibility` from `useBackendColumns` |
| Advanced mode but simple URL | Set `enableAdvancedFilter`; user must switch mode in toolbar |
| `fetch` typed as ServerTableState | Runtime is `Record<string, string>` from serializer |

---

## Advanced topics (app-proven)

| Topic | Doc |
|-------|-----|
| Custom fetch, pagination mapping, templates | [advanced-server.md](advanced-server.md) |
| filterBy dependent columns | [advanced-server.md](advanced-server.md) |
| Action bar, row selection, store actions | [advanced-server.md](advanced-server.md) |
| Client mode, dialogs, hand-written columns | [advanced-client.md](advanced-client.md) |
| Data flow / URL keys | [architecture.md](architecture.md) |
| Copy-paste pages | [examples.md](examples.md) |
| Full API reference | [reference.md](reference.md) |
