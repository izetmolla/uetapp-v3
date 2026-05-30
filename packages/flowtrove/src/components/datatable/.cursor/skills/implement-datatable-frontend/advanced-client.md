# Client-side DataTable

`source.type === "client"` loads all rows once; TanStack applies **filter, sort, and pagination in the browser**. No `serializeServerTableParams`, no list API round-trip on page change.

**No production app page uses this yet** — supported by `index.tsx` and `useDataTable`. Use for pickers, admin previews, Storybook, or small static datasets.

---

## When to use

| Good fit | Poor fit |
|----------|----------|
| < 500 rows after load | Large DB tables |
| Data already fetched for parent form | Need SQL-level filters |
| Modal row picker | Shareable deep-linked filter URLs across sessions |
| Prototyping UI before API exists | Accurate total counts on huge tables |

---

## Basic client table

```tsx
"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@workspace/flowtrove/components/datatable";
import { DataTableColumnHeader } from "@workspace/flowtrove/components/datatable/components/data-table-column-header";
import type { ColumnDef } from "@tanstack/react-table";

type Row = { id: string; name: string; status: "active" | "inactive" };

const columns: ColumnDef<Row>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    enableColumnFilter: true,
    meta: {
      variant: "text",
      label: "Name",
      placeholder: "Search name...",
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    enableColumnFilter: true,
    meta: {
      variant: "select",
      label: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    cell: ({ row }) => row.getValue("status"),
  },
];

export function ClientTableDemo() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    void fetch("/api/local-rows").then((r) => r.json()).then(setRows);
  }, []);

  return (
    <DataTable<Row>
      columns={columns}
      source={{ type: "client", data: rows }}
      enableToolbar
      enablePagination
      initialPerPage={10}
      getRowId={(row) => row.id}
    />
  );
}
```

### What happens internally

- `useDataTable` sets `serverSide: false`
- Enables `getFilteredRowModel`, `getSortedRowModel`, `getPaginationRowModel`
- URL keys `page`, `perPage`, `sort`, and per-column filters still sync (unless `disableParamPersistence`)
- Text filters debounce 300ms (`DEBOUNCE_MS_DEFAULT`) before updating URL

---

## Client table in a dialog (no URL sync)

Prevent list filters from polluting the page URL:

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="flex max-h-[85vh] flex-col">
    <DataTable<Row>
      disableParamPersistence
      fillHeight
      stickyHeader
      columns={columns}
      source={{ type: "client", data: candidates }}
      enableToolbar
      enablePagination
      initialState={{ pagination: { pageSize: 5 } }}
      rowIdKey="id"
      enableRowSelection
      onSelectionChange={setSelected}
    />
  </DialogContent>
</Dialog>
```

`disableParamPersistence` mounts `DataTableLocalStateProvider` — state lives in React only.

---

## Client + advanced filters

Advanced mode still works if `enableAdvancedFilter` is set; advanced state uses local or URL `filters` JSON via the same hooks.

For dialogs, prefer **simple toolbar filters** only (`enableToolbar` without advanced) to reduce complexity.

---

## Client with row selection + action bar

```tsx
<DataTable
  source={{ type: "client", data: rows }}
  columns={columns}
  enableRowSelection
  actionBar={(table) => (
    <DataTableActionBar table={table}>
      <DataTableActionBarSelection table={table} />
      <Button onClick={() => exportSelected(table)}>Export</Button>
    </DataTableActionBar>
  )}
/>
```

Selection uses `table.getFilteredSelectedRowModel()` — respects active client-side filters.

---

## Hybrid: client table + server columns definition

Load column defs from API once, data client-side:

```tsx
const { columns, isLoading } = useBackendColumns<Row>({
  fetchColumns: () => getPreviewColumns(),
  queryKey: ["preview", "columns"],
  enabled: open,
});

<DataTable
  columns={columns}
  source={{ type: "client", data: localRows }}
  disableParamPersistence
/>
```

Backend columns endpoint without list endpoint — useful for consistent filter metadata.

---

## Low-level composition (client or server)

Split `<DataTable />` when you need custom layout:

```tsx
import {
  useDataTable,
  useServerTableData,
  DataTableToolbar,
  DataTableContent,
  DataTablePagination,
} from "@workspace/flowtrove/components/datatable";

function CustomLayout<T>() {
  const columns = ...;
  const server = useServerTableData({ fetch, queryKey: ["x"], columns });
  const { table } = useDataTable({
    data: server.data,
    columns,
    pageCount: server.pagination.pageCount ?? 0,
    serverSide: true,
  });

  return (
    <div>
      <DataTableToolbar table={table} clearColumnFilters={server.clearColumnFilters} />
      <DataTableContent table={table} />
      <DataTablePagination table={table} serverSide isFetching={server.isFetching} />
    </div>
  );
}
```

For pure client, omit `useServerTableData` and pass `data` + `serverSide: false`.

---

## Client filter behavior by variant

Same toolbar components as server mode (`DataTableToolbar` → variant-specific inputs). Filtering runs against loaded rows only — no `iLike` unless you implement fuzzy match in `filterFn` (default is TanStack substring for text columns).

To customize client filter logic:

```tsx
{
  id: "name",
  accessorKey: "name",
  filterFn: (row, id, value) => {
    return String(row.getValue(id)).toLowerCase().includes(String(value).toLowerCase());
  },
}
```

---

## Migrating client → server

1. Add Go/backend list + columns endpoints.
2. Replace `source` with `type: "server"` and `fetch`/`queryKey`.
3. Switch to `useBackendColumns` or keep hand-written columns if IDs match backend.
4. Remove client-only `filterFn` overrides — server handles operators.
5. Verify `serializeServerTableParams` output against API in Network tab.

---

## Testing client tables

- No `serialize-server-table-params` contract
- Test filter UX with vitest + RTL on toolbar if needed
- For serializer changes (server), keep existing tests in `lib/*.test.ts`
