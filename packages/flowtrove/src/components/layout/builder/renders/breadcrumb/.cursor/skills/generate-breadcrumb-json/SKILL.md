---
name: generate-breadcrumb-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `breadcrumb`. Use when
  building layout JSON, MCP layout tools, or adding Breadcrumb items to
  LayoutBuilder trees.
---

# Generate Breadcrumb layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`breadcrumb`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "breadcrumb",
  "id": "breadcrumb-1"
}
```

---

## Field guide (primary type: `breadcrumb`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"breadcrumb"` |
| `id` | yes | Unique in tree |
| `children` | no | See types.ts |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`breadcrumb-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `breadcrumb` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |

