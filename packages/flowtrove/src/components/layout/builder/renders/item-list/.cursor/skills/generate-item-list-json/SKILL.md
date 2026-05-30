---
name: generate-item-list-json
description: >-
  Generates and validates Flowtrove layout builder JSON for `item-list`. Use when
  building layout JSON, MCP layout tools, or adding Item List items to
  LayoutBuilder trees.
---

# Generate Item List layout JSON

Produces valid items for `LayoutBuilder`. Schema source: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Set type (`item-list`) and unique id
- [ ] 2. Add required props from types.ts
- [ ] 3. Nest inside appropriate parent (div, form, card, …)
- [ ] 4. Add condition if visibility depends on data
- [ ] 5. Validate JSON (strict, no trailing commas)
```

---

## Minimal template

```json
{
  "type": "item-list",
  "id": "item-list-1"
}
```

---

## Field guide (primary type: `item-list`)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"item-list"` |
| `id` | yes | Unique in tree |
| `source` | no | Key on `LayoutBuilder` runtime `data` for the array to iterate. |
| `list` | no | Static rows (e.g. designer preview) when live `data[source]` is missing or empty. |
| `itemName` | no | Binding name for the row object in `{{ }}` scope (default `"item"`). |
| `interpolation` | no | Override `LayoutBuilder` interpolation for this list's row template only. |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a single item.
2. Use **stable, descriptive ids** (`item-list-save`, not `x1`).
3. Do **not** invent props absent from `types.ts`.
4. Form fields must live under a `form` item to bind values.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Wrong `type` string | Use exactly: `item-list` |
| Missing `id` | Every item requires unique `id` |
| Invalid JSON | No comments; no trailing commas |

