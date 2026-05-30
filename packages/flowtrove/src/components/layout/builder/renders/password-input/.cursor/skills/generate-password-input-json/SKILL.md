---
name: generate-password-input-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `password-input`. Use when
  building layout JSON, MCP layout tools, or adding Password Input items to
  LayoutBuilder trees.
---

# Generate Password Input layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`password-input`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "password-input",
  "id": "password-input-1",
  "name": "fieldName",
  "label": "Label"
}
```

---

## Field guide (primary type: `password-input`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"password-input"` |
| `id` | yes | Unique in tree |
| `name` | yes | Form field key (react-hook-form) |
| `validation` | no | Zod rules object |
| `showVisibilityToggle` | no | Show eye icon to toggle visibility (default true). |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`password-input-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `password-input` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |
| Missing `name` on form field | Add `name` for RHF binding |
