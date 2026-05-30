---
name: generate-card-json
description: >-
  Generates and validates Flowtrove layout builder JSON for card types (card,
  card-header, card-title, card-content, card-footer, etc.): legacy flat props vs
  composed slot mode. Use when building layout JSON, MCP layout tools, or card UI trees.
---

# Generate card layout JSON

Produces valid `CardItem` and slot objects for `LayoutBuilder`. Schema: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Choose legacy OR composed mode (see below)
- [ ] 2. Set type: "card" and unique id on root
- [ ] 3. Legacy: title/description/headerAction/footer + children (body)
- [ ] 4. Composed: children = card-header, card-content, optional card-footer
- [ ] 5. card-title / card-description need text, not label
- [ ] 6. Nest buttons in headerAction, card-action, or card-footer
```

---

## Mode decision

| Use legacy | Use composed |
|------------|--------------|
| Simple title + body + optional footer | Full control over slot order/styling |
| MCP quick cards | Designer-built slot trees |
| Flat strings for title/description | Nested card-action with buttons |

**Composed triggers when** `children` contains any of: `card-header`, `card-content`, `card-footer`.

---

## Minimal templates

**Legacy:**

```json
{
  "type": "card",
  "id": "card-1",
  "title": "Title",
  "description": "Description",
  "children": [
    { "type": "div", "id": "card-1-body", "className": "text-sm", "children": [] }
  ]
}
```

**Composed:**

```json
{
  "type": "card",
  "id": "card-2",
  "children": [
    {
      "type": "card-header",
      "id": "card-2-h",
      "children": [
        { "type": "card-title", "id": "card-2-t", "text": "Title" },
        { "type": "card-description", "id": "card-2-d", "text": "Description" }
      ]
    },
    {
      "type": "card-content",
      "id": "card-2-c",
      "children": []
    }
  ]
}
```

Full schema: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Slot types

| `type` | Key props |
|--------|-----------|
| `card-header` | `children?` |
| `card-title` | `text` (required) |
| `card-description` | `text` (required) |
| `card-action` | `children?` — usually buttons |
| `card-content` | `children?`, `paddingTopWhenNoHeader?` |
| `card-footer` | `children?` |

---

## Output rules (MCP / agents)

1. Never mix legacy flat props with composed slot children on the same card.
2. Use descriptive ids (`card-settings`, `card-settings-footer`).
3. Prefer legacy for simple MCP cards; composed for complex layouts.
4. Buttons in footer/header: use button skill (`../button/.cursor/...`).

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Composed mode but used `title` | Move title to `card-title` inside `card-header` |
| `card-title` with `label` | Use `text` |
| No padding without header (composed) | Set `paddingTopWhenNoHeader: true` on `card-content` |
| Invalid size | Only `default` or `sm` |
