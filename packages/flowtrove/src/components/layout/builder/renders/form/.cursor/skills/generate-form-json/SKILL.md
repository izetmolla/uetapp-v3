---
name: generate-form-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `form`. Use when
  building layout JSON, MCP layout tools, or adding Form items to
  LayoutBuilder trees.
---

# Generate Form layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`form`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "form",
  "id": "form-1"
}
```

---

## Field guide (primary type: `form`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"form"` |
| `id` | yes | Unique in tree |
| `children` | no | Form children |
| `name` | no | HTML `name` on the root form element (identifies the form in the document). |
| `formConfigKey` | no | Key from designer config.forms_fields to bind this form to; when set, field names are restricted to that config. |
| `source` | no | Key on layout `data` whose object pre-fills named fields (merged over JSON defaults). |
| `value` | no | Static values merged over field defaults when live `data[source]` is absent. |
| `action` | no | Form action URL |
| `method` | no | HTTP method |
| `encType` | no | Encoding type |
| `onSubmitAction` | no | Behaviour after submit |
| `redirectUrl` | no | Redirect URL (when onSubmitAction is "redirect") |
| `showSuccessToast` | no | Show success toast on submit |
| `successMessage` | no | Success toast message |
| `showErrorAsToast` | no | Show server/validation errors as toast instead of inline banner |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`form-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `form` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |

