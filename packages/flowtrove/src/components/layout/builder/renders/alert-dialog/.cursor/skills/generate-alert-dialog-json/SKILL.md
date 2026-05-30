---
name: generate-alert-dialog-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `alert-dialog`, `alert-dialog-trigger`, `alert-dialog-content`, `alert-dialog-header`, `alert-dialog-title`, `alert-dialog-description`, `alert-dialog-footer`. Use when
  building layout JSON, MCP layout tools, or adding Alert Dialog items to
  LayoutBuilder trees.
---

# Generate Alert Dialog layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`alert-dialog`, `alert-dialog-trigger`, `alert-dialog-content`, `alert-dialog-header`, `alert-dialog-title`, `alert-dialog-description`, `alert-dialog-footer`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "alert-dialog",
  "id": "alert-dialog-1"
}
```

## Slot / related types

This folder also registers: `alert-dialog-trigger`, `alert-dialog-content`, `alert-dialog-header`, `alert-dialog-title`, `alert-dialog-description`, `alert-dialog-footer`. Each needs its own `type` discriminant — see [reference.md](reference.md).

---

## Field guide (primary type: `alert-dialog`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"alert-dialog"` |
| `id` | yes | Unique in tree |
| `children` | no | See types.ts |
| `trigger` | no | See types.ts |
| `title` | no | See types.ts |
| `description` | no | See types.ts |
| `footer` | no | See types.ts |
| `size` | no | See types.ts |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`alert-dialog-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `alert-dialog`, `alert-dialog-trigger`, `alert-dialog-content`, `alert-dialog-header`, `alert-dialog-title`, `alert-dialog-description`, `alert-dialog-footer` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |

