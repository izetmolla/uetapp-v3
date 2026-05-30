---
name: generate-tooltip-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `tooltip`, `tooltip-trigger`, `tooltip-content`. Use when
  building layout JSON, MCP layout tools, or adding Tooltip items to
  LayoutBuilder trees.
---

# Generate Tooltip layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`tooltip`, `tooltip-trigger`, `tooltip-content`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "tooltip",
  "id": "tooltip-1"
}
```

## Slot / related types

This folder also registers: `tooltip-trigger`, `tooltip-content`. Each needs its own `type` discriminant — see [reference.md](reference.md).

---

## Field guide (primary type: `tooltip`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"tooltip"` |
| `id` | yes | Unique in tree |
| `children` | no | See types.ts |
| `content` | no | See types.ts |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`tooltip-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `tooltip`, `tooltip-trigger`, `tooltip-content` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |

