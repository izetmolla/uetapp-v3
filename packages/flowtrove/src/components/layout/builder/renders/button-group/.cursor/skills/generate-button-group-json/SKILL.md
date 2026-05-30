---
name: generate-button-group-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `button-group`, `button-group-separator`, `button-group-text`. Use when
  building layout JSON, MCP layout tools, or adding Button Group items to
  LayoutBuilder trees.
---

# Generate Button Group layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`button-group`, `button-group-separator`, `button-group-text`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "button-group",
  "id": "button-group-1"
}
```

## Slot / related types

This folder also registers: `button-group-separator`, `button-group-text`. Each needs its own `type` discriminant — see [reference.md](reference.md).

---

## Field guide (primary type: `button-group`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"button-group"` |
| `id` | yes | Unique in tree |
| `children` | no | See types.ts |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`button-group-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `button-group`, `button-group-separator`, `button-group-text` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |

