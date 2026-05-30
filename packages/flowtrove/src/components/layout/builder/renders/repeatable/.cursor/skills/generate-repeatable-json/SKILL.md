---
name: generate-repeatable-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `repeatable`. Use when
  building layout JSON, MCP layout tools, or adding Repeatable items to
  LayoutBuilder trees.
---

# Generate Repeatable layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`repeatable`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "repeatable",
  "id": "repeatable-1",
  "name": "fieldName",
  "label": "Label"
}
```

---

## Field guide (primary type: `repeatable`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"repeatable"` |
| `id` | yes | Unique in tree |
| `name` | yes | Form field key (react-hook-form) |
| `validation` | no | Zod rules object |
| `fields` | no | Column/field definitions for each row |
| `addButtonLabel` | no | Label for the "Add" button |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`repeatable-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `repeatable` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |
| Missing `name` on form field | Add `name` for RHF binding |
