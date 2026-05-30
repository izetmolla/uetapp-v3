---
name: generate-content-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `content`. Use when
  building layout JSON, MCP layout tools, or adding Content items to
  LayoutBuilder trees.
---

# Generate Content layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`content`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "content",
  "id": "content-1"
}
```

---

## Field guide (primary type: `content`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"content"` |
| `id` | yes | Unique in tree |
| `source` | no | Key on runtime `data`, or descriptor with optional HTTP load via TanStack Query. |
| `value` | no | Inline object when live `data[source]` is absent or not a plain object. |
| `objectName` | no | Name of the object in `{{ content.title }}` style bindings (default `"content"`). |
| `interpolation` | no | Override `LayoutBuilder` interpolation for this block's template only. |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`content-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `content` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |

