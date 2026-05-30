---
name: generate-rs-async-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `rs-async`. Use when
  building layout JSON, MCP layout tools, or adding Rs Async items to
  LayoutBuilder trees.
---

# Generate Rs Async layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`rs-async`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "rs-async",
  "id": "rs-async-1",
  "name": "fieldName",
  "label": "Label"
}
```

---

## Field guide (primary type: `rs-async`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"rs-async"` |
| `id` | yes | Unique in tree |
| `name` | yes | Form field key (react-hook-form) |
| `validation` | no | Zod rules object |
| `optionsApi` | no | Options API config (required for async remote search). |
| `loadOptionsUrl` | no | @deprecated Use `optionsApi`. Simple GET URL with `?search=` query param. |
| `options` | no | Static options for label lookup / defaultOptions seed. |
| `defaultOptions` | no | Default options: true = load on open, or initial option list. |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`rs-async-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `rs-async` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |
| Missing `name` on form field | Add `name` for RHF binding |
