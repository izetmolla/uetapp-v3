---
name: implement-datatable
description: >-
  Implements server-side datatables in Go Fiber apps using flowtrove/packages/datatable
  and TanStack-aligned query params. Use when adding or changing datatable list APIs,
  column endpoints, filters, sorting, pagination, postgresql.Find/FindRaw, or
  tablequery.Extract integration.
---

# Implement server datatable

End-to-end workflow for a new table in `backends/app`. Frontend uses Flowtrove datatable (`packages/flowtrove`); backend uses this package.

## Checklist

Copy and track progress:

```
- [ ] 1. Define get*Columns(ctx) []datatable.Column
- [ ] 2. Register Get*Columns route → datatable.GetColumns(columns)
- [ ] 3. Register list API + optional list view
- [ ] 4. Parse with tablequery.Extract(c, columns)
- [ ] 5. Query with postgresql.Find or FindRaw (+ joins if needed)
- [ ] 6. datatable.FormatContent for IsJSON columns
- [ ] 7. Return { data, pagination: RenderPagination(...) }
- [ ] 8. Wire frontend columnsUrl + dataUrl to new routes
- [ ] 9. go test in backends/packages/datatable if changing parsing/SQL
```

## Step 1 — Columns

Create `getFooColumns(ctx context.Context) ([]datatable.Column, error)`:

- One slice used everywhere (columns API, list API, SQL).
- Set `EnableSorting` / `EnableColumnFilter` only when supported.
- Put filter UI config in `Meta` (`Variant`, `Label`, `Placeholder`, `Options`).
- Use `SQLColumn` for computed SELECT fields; `FilterSQLColumn` when filtering a different field than displayed.
- `Hidden: true` for id columns and advanced-only fields.

Return to frontend:

```go
func (cc *Controller) GetFooColumns(c fiber.Ctx) error {
    columns, err := cc.getFooColumns(c.Context())
    if err != nil { /* ... */ }
    return cc.app.Api(c, cc.app.Render().WithData(datatable.GetColumns(columns)))
}
```

## Step 2 — List handler

```go
columns, err := cc.getFooColumns(c.Context())
q, err := tablequery.Extract(c, columns)
// Choose one:
items, p, err := postgresql.Find[models.Foo](db.Model(&models.Foo{}), q, columns)
items, p, err := postgresql.FindRaw[map[string]any](db, q, columns, models.Foo{}.TableName()).Run()
datatable.FormatContent(&items, columns)
```

**FindRaw** when columns use SQL expressions or joins:

```go
postgresql.FindRaw[map[string]any](db, q, columns, "students").
    AddJoin("LEFT JOIN ...").
    Run()
```

## Step 3 — Dependent filters

If `Meta.FilterBy` links columns (e.g. faculty → study_level):

```go
parent := tablequery.GetFilterValue(c, "study_level")
// filter DB options, set Meta.Options on dependent column
```

Frontend refetches the columns endpoint when the parent filter changes.

## Step 4 — Manual SQL (escape hatch)

```go
where, args := datatable.ConditionsFromFilters(q.Filters, q.JoinOperator, columns)
order := datatable.OrderByClause(q.Sorts, datatable.ColumnNameByID(columns))
if where != "" { db = db.Where(where, args...) }
```

Prefer `postgresql.Find` so placeholders stay bound.

## Decision guide

| Situation | Use |
|-----------|-----|
| Plain table, model fields map 1:1 | `postgresql.Find[Model]` |
| CONCAT, subqueries, custom SELECT | `FindRaw[map[string]any]` |
| Extra JOINs | `FindRaw` + `AddJoin` |
| Proxy to external API | `ExtractQuery` + forward filters (see syncstudent list) |
| Read single filter in columns handler | `tablequery.GetFilterValue` |

## Pitfalls

- Mismatched column `ID` vs frontend column id → sorts/filters silently dropped
- Forgetting the same `columns` in Extract and Find → wrong WHERE/ORDER BY
- Using `ColumnNameByID` for filters — use `FilterColumnNameByID` / pass full `columns` to `ConditionsFromFilters`
- README mentions `DefaultVisible` — use `Hidden: true` on `Column` instead

## Additional resources

- API & query param reference: [reference.md](reference.md)
- Full code samples: [examples.md](examples.md)
- Package README: [../../README.md](../../README.md)
- PostgreSQL helper: [../../postgresql/README.md](../../postgresql/README.md)
