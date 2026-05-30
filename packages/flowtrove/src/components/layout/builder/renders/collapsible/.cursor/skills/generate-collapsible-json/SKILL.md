---
name: generate-collapsible-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `collapsible`, `collapsible-trigger`, `collapsible-content`. Use when
  building layout JSON, MCP layout tools, or adding Collapsible items to
  LayoutBuilder trees.
---

# Generate Collapsible layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`collapsible`, `collapsible-trigger`, `collapsible-content`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "collapsible",
  "id": "collapsible-1"
}
```

## Slot / related types

This folder also registers: `collapsible-trigger`, `collapsible-content`. Each needs its own `type` discriminant — see [reference.md](reference.md).

---

## Field guide (primary type: `collapsible`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"collapsible"` |
| `id` | yes | Unique in tree |
| `children` | no | See types.ts |
| `open` | no | See types.ts |
| `triggerLabel` | no | See types.ts |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`collapsible-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `collapsible`, `collapsible-trigger`, `collapsible-content` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |

