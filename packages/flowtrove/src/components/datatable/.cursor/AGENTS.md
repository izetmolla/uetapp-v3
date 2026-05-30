# Flowtrove DataTable — AI context

TanStack Table v8 + **nuqs** (URL state) + **React Query** (server lists). Contract with Go `backends/packages/datatable` via `serializeServerTableParams`.

## Documentation map

| Doc | Use when |
|-----|----------|
| [skills/implement-datatable-frontend/SKILL.md](skills/implement-datatable-frontend/SKILL.md) | **Start here** — server vs client checklists |
| [skills/implement-datatable-frontend/architecture.md](skills/implement-datatable-frontend/architecture.md) | Understanding data flow, URL keys, mode switching |
| [skills/implement-datatable-frontend/reference.md](skills/implement-datatable-frontend/reference.md) | API surface, types, serialization, filter variants |
| [skills/implement-datatable-frontend/examples.md](skills/implement-datatable-frontend/examples.md) | Standard app list pages (copy-paste) |
| [skills/implement-datatable-frontend/advanced-server.md](skills/implement-datatable-frontend/advanced-server.md) | Custom fetch, filterBy, action bar, store actions, stats |
| [skills/implement-datatable-frontend/advanced-client.md](skills/implement-datatable-frontend/advanced-client.md) | Client-side tables, dialogs, local data |
| Backend | `backends/packages/datatable/.cursor/skills/implement-datatable/` |

## App reference implementations (verified in repo)

| Pattern | Path |
|---------|------|
| Standard server list | `apps/app/src/pages/cadmin/pages/resources/pages/list/` |
| Row actions + `setRowAction` | `apps/app/src/pages/cadmin/pages/orgunits/pages/list/` |
| Store-based actions + rich overrides | `apps/app/src/pages/cadmin/pages/users/pages/list/` |
| Stats above table | `apps/app/src/pages/cadmin/pages/users/pages/list/components/stats-card.tsx` |
| Custom fetch + extra response fields | `apps/app/src/pages/secretary/pages/suplements/pages/student1/` |
| Fetch side-effect (current session id) | `apps/app/src/pages/account/pages/pages/sessions/` |
| Contracts students list | `apps/app/src/pages/contracts/pages/students/pages/list/` |

**Note:** All production tables today use **server** mode. Client mode is supported by `<DataTable source={{ type: "client" }}>` — see [advanced-client.md](skills/implement-datatable-frontend/advanced-client.md).

## Package layout

| Path | Role |
|------|------|
| `index.tsx` | `<DataTable />` — unified server/client entry |
| `hooks/use-datatable.ts` | TanStack ↔ nuqs/local state |
| `hooks/use-server-table-data.ts` | React Query + serialization |
| `hooks/use-backend-columns.ts` | Columns API + `filterBy` refetch |
| `hooks/use-advanced-filters-query-state.ts` | Advanced `filters` URL JSON |
| `lib/serialize-server-table-params.ts` | Go contract |
| `lib/column-converter.tsx` | Backend → `ColumnDef` |
| `lib/parsers.ts` | nuqs parsers (sort, advanced filters) |
| `context/data-table-local-state.tsx` | In-memory state when URL disabled |
| `config/data-table.ts` | Operators & variants |
| `components/data-table.tsx` | `DataTableContent` — table shell only |

## Rules

- [rules/datatable-component-core.mdc](rules/datatable-component-core.mdc) — this package
- [rules/datatable-app-pages.mdc](rules/datatable-app-pages.mdc) — `apps/**` consumers
