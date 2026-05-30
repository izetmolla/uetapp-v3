---
name: generate-skeleton-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `skeleton`. Use when
  building layout JSON, MCP layout tools, or adding Skeleton items to
  LayoutBuilder trees.
---

# Generate Skeleton layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`skeleton`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "skeleton",
  "id": "skeleton-1"
}
```

---

## Field guide (primary type: `skeleton`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"skeleton"` |
| `id` | yes | Unique in tree |
| `children` | no | See types.ts |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`skeleton-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `skeleton` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |

