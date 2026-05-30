---
name: generate-slider-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `slider`. Use when
  building layout JSON, MCP layout tools, or adding Slider items to
  LayoutBuilder trees.
---

# Generate Slider layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`slider`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "slider",
  "id": "slider-1",
  "name": "fieldName",
  "label": "Label"
}
```

---

## Field guide (primary type: `slider`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"slider"` |
| `id` | yes | Unique in tree |
| `name` | yes | Form field key (react-hook-form) |
| `validation` | no | Zod rules object |
| `defaultValue` | no | See types.ts |
| `min` | no | See types.ts |
| `max` | no | See types.ts |
| `step` | no | See types.ts |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`slider-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `slider` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |
| Missing `name` on form field | Add `name` for RHF binding |
