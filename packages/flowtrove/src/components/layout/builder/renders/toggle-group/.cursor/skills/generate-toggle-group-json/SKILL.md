---
name: generate-toggle-group-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `toggle-group`, `toggle-group-item`. Use when
  building layout JSON, MCP layout tools, or adding Toggle Group items to
  LayoutBuilder trees.
---

# Generate Toggle Group layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`toggle-group`, `toggle-group-item`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "toggle-group",
  "id": "toggle-group-1"
}
```

## Slot / related types

This folder also registers: `toggle-group-item`. Each needs its own `type` discriminant — see [reference.md](reference.md).

---

## Field guide (primary type: `toggle-group`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"toggle-group"` |
| `id` | yes | Unique in tree |
| `children` | no | See types.ts |
| `groupType` | no | See types.ts |
| `defaultValue` | no | See types.ts |
| `variant` | no | See types.ts |
| `size` | no | See types.ts |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`toggle-group-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `toggle-group`, `toggle-group-item` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |

