---
name: generate-select-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `select`. Use when
  building layout JSON, MCP layout tools, or adding Select items to
  LayoutBuilder trees.
---

# Generate Select layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`select`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "select",
  "id": "select-1",
  "name": "fieldName",
  "label": "Label"
}
```

---

## Field guide (primary type: `select`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"select"` |
| `id` | yes | Unique in tree |
| `name` | yes | Form field key (react-hook-form) |
| `validation` | no | Zod rules object |
| `placeholder` | no | Placeholder when nothing selected. |
| `defaultValue` | no | Default / initial value. |
| `fetchOptions` | no | @deprecated Prefer object-form `options`. Kept for backward compatibility. |
| `replaceOptions` | no | When true, fetched options replace static options. |
| `size` | no | SelectTrigger size. |
| `clearable` | no | Show clear control on trigger. |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`select-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Options shape

| Shape | When |
|-------|------|
| `[{ "value", "label" }, …]` | Static list |
| `{ "url", "method?", "params?" }` | HTTP fetch at render time |
| `fetchOptions` (deprecated) | Legacy — prefer object-form `options` |

Remote selects validate as free strings in the form schema (options load async).

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `select` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |
| Missing `name` on form field | Add `name` for RHF binding |
| HTTP options as array | Use object `{ "url": "…" }`, not `[{ url: … }]` |
| Mixing `fetchOptions` + `options` | Prefer `options` object form only |
