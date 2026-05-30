---
name: generate-table-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `table`, `table-header`, `table-body`, `table-row`, `table-head`, `table-cell`, `table-footer`. Use when
  building layout JSON, MCP layout tools, or adding Table items to
  LayoutBuilder trees.
---

# Generate Table layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`table`, `table-header`, `table-body`, `table-row`, `table-head`, `table-cell`, `table-footer`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "table",
  "id": "table-1"
}
```

## Slot / related types

This folder also registers: `table-header`, `table-body`, `table-row`, `table-head`, `table-cell`, `table-footer`. Each needs its own `type` discriminant — see [reference.md](reference.md).

---

## Field guide (primary type: `table`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"table"` |
| `id` | yes | Unique in tree |
| _(see types.ts)_ | — | — |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`table-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `table`, `table-header`, `table-body`, `table-row`, `table-head`, `table-cell`, `table-footer` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |

