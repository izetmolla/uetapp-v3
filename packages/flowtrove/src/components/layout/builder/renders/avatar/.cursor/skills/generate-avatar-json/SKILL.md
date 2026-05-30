---
name: generate-avatar-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `avatar`. Use when
  building layout JSON, MCP layout tools, or adding Avatar items to
  LayoutBuilder trees.
---

# Generate Avatar layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`avatar`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "avatar",
  "id": "avatar-1"
}
```

---

## Field guide (primary type: `avatar`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"avatar"` |
| `id` | yes | Unique in tree |
| `src` | no | See types.ts |
| `fallback` | no | See types.ts |
| `size` | no | See types.ts |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`avatar-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `avatar` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |

