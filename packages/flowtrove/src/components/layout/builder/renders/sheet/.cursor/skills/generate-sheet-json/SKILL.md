---
name: generate-sheet-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `sheet`, `sheet-trigger`, `sheet-content`, `sheet-header`, `sheet-title`, `sheet-description`, `sheet-footer`. Use when
  building layout JSON, MCP layout tools, or adding Sheet items to
  LayoutBuilder trees.
---

# Generate Sheet layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`sheet`, `sheet-trigger`, `sheet-content`, `sheet-header`, `sheet-title`, `sheet-description`, `sheet-footer`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "sheet",
  "id": "sheet-1"
}
```

## Slot / related types

This folder also registers: `sheet-trigger`, `sheet-content`, `sheet-header`, `sheet-title`, `sheet-description`, `sheet-footer`. Each needs its own `type` discriminant — see [reference.md](reference.md).

---

## Field guide (primary type: `sheet`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"sheet"` |
| `id` | yes | Unique in tree |
| `children` | no | See types.ts |
| `trigger` | no | See types.ts |
| `title` | no | See types.ts |
| `description` | no | See types.ts |
| `footer` | no | See types.ts |
| `side` | no | See types.ts |
| `showCloseButton` | no | See types.ts |
| `triggerClassName` | no | See types.ts |
| `contentClassName` | no | See types.ts |
| `headerClassName` | no | See types.ts |
| `titleClassName` | no | See types.ts |
| `descriptionClassName` | no | See types.ts |
| `footerClassName` | no | See types.ts |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`sheet-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `sheet`, `sheet-trigger`, `sheet-content`, `sheet-header`, `sheet-title`, `sheet-description`, `sheet-footer` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |

