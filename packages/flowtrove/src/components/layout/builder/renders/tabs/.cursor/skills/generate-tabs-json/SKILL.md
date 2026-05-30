---
name: generate-tabs-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `tabs`, `tabs-list`, `tabs-trigger`, `tabs-content`. Use when
  building layout JSON, MCP layout tools, or adding Tabs items to
  LayoutBuilder trees.
---

# Generate Tabs layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`tabs`, `tabs-list`, `tabs-trigger`, `tabs-content`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Mode decision

| Use legacy (`tabs` array) | Use composed (slot children) |
|---------------------------|------------------------------|
| Simple tab panels with labels | Custom tab list / trigger styling |
| MCP quick tabs | Designer-built slot trees |

**Composed mode** uses `children` with `tabs-list`, `tabs-trigger`, `tabs-content`. **Legacy mode** uses the `tabs` prop array.

---

## Minimal template

**Legacy:**

```json
{
  "type": "tabs",
  "id": "tabs-1",
  "defaultValue": "a",
  "tabs": [
    { "value": "a", "label": "Tab A", "children": [] }
  ]
}
```

## Slot / related types

This folder also registers: `tabs-list`, `tabs-trigger`, `tabs-content`. Each needs its own `type` discriminant — see [reference.md](reference.md).

---

## Field guide (primary type: `tabs`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"tabs"` |
| `id` | yes | Unique in tree |
| `children` | no | See types.ts |
| `tabs` | no | See types.ts |
| `defaultValue` | no | See types.ts |
| `orientation` | no | See types.ts |
| `listVariant` | no | See types.ts |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`tabs-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `tabs`, `tabs-list`, `tabs-trigger`, `tabs-content` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |

