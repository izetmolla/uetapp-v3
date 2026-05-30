---
name: generate-input-group-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `input-group`. Use when
  building layout JSON, MCP layout tools, or adding Input Group items to
  LayoutBuilder trees.
---

# Generate Input Group layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`input-group`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "input-group",
  "id": "input-group-1"
}
```

---

## Field guide (primary type: `input-group`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"input-group"` |
| `id` | yes | Unique in tree |
| `children` | no | See types.ts |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`input-group-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `input-group` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |

