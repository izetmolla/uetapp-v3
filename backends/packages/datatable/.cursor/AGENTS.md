# Datatable package — AI context

Backend helpers for **Flowtrove / TanStack Table** server-side datatables. Pair with frontend `packages/flowtrove` datatable components.

## When implementing a new table in an app

1. Read [skills/implement-datatable/SKILL.md](skills/implement-datatable/SKILL.md) and follow its checklist.
2. Use [skills/implement-datatable/reference.md](skills/implement-datatable/reference.md) for query params, operators, and column fields.
3. Copy patterns from [skills/implement-datatable/examples.md](skills/implement-datatable/examples.md) and existing modules:
   - `backends/app/modules/cadmin/users/list/`
   - `backends/app/modules/contracts/internal/students/list/`

## Package layout

| Path | Role |
|------|------|
| `datatable.go` | `Column`, `ColumnMeta`, `GetColumns`, `FormatContent`, pagination |
| `query.go` | `TableQuery`, `ExtractQuery` |
| `operators.go` | Filter SQL builders, operator constants |
| `order.go` | `OrderByClause` |
| `filters_*.go` | Advanced filter groups, JSON parsing |
| `postgresql/` | `Find`, `FindRaw` GORM helpers |

## App integration (required)

- Parse requests with `github.com/uetedu/app/pkg/tablequery`.**Extract** (preferred) or `datatable.ExtractQuery(c.OriginalURL(), columns)`.
- Return columns via `datatable.GetColumns(columns)` from a `Get*Columns` handler.
- Return list data as `{ "data": [...], "pagination": datatable.RenderPagination(p) }`.
- Use the **same** `columns` slice for columns endpoint, `Extract`, and `postgresql.Find` / `FindRaw`.

## Rules (auto-applied by Cursor)

- `.cursor/rules/datatable-core.mdc` — editing this package
- `.cursor/rules/datatable-app-integration.mdc` — app list handlers using datatable
