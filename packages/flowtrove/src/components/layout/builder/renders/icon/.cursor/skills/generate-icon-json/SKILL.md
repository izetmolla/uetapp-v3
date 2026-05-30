---
name: generate-icon-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `icon`. Use when
  building layout JSON, MCP layout tools, or adding Icon items to
  LayoutBuilder trees.
---

# Generate Icon layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`icon`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "icon",
  "id": "icon-1"
}
```

---

## Field guide (primary type: `icon`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"icon"` |
| `id` | yes | Unique in tree |
| `name` | no | See types.ts |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`icon-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `icon` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |

