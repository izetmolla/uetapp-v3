---
name: generate-div-json
description: >-
  Generates and validates Flowtrove layout builder JSON for type "div": native HTML
  containers, Tailwind className layout, nesting children, aria/data attributes. Use
  when building layout JSON, MCP tools, or grouping cards/buttons/forms.
---

# Generate div layout JSON

Produces valid `DivItem` objects for `LayoutBuilder`. Schema: `types.ts`.

---

## Quick checklist

```
- [ ] 1. type: "div" and unique id
- [ ] 2. className for layout (flex, grid, space-y, padding)
- [ ] 3. children array with nested LayoutBuilderItem objects
- [ ] 4. condition if section visibility depends on data
- [ ] 5. role/aria-* only when semantics need it
```

---

## Minimal template

```json
{
  "type": "div",
  "id": "section-main",
  "className": "space-y-4",
  "children": []
}
```

---

## Field guide

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | Always `"div"` |
| `id` | yes | Unique in tree |
| `children` | no | Nested layout items |
| `className` | no | Tailwind / CSS classes |
| `style` | no | Inline styles object |
| `condition` | no | Hide when false |
| HTML attrs | no | `role`, `aria-label`, `data-testid`, … |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Common className patterns

| Pattern | className |
|---------|-----------|
| Vertical stack | `"space-y-4"` |
| Horizontal row | `"flex items-center gap-2"` |
| End-aligned actions | `"flex gap-2 justify-end"` |
| Responsive grid | `"grid gap-4 md:grid-cols-2 lg:grid-cols-3"` |
| Muted text block | `"text-sm text-muted-foreground"` |
| Full width | `"w-full"` |

---

## Output rules (MCP / agents)

1. Prefer div for **structure**, not interactivity — use `button` for clicks.
2. Always include meaningful ids (`section-header`, `form-fields`, not `d1`).
3. Empty containers: `"children": []` or omit children.
4. Nest cards, buttons, dialogs inside div children.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Click handler on div | Use `button` or wrap buttons |
| Flat page with no wrapper | Wrap sections in div with `space-y-4` |
| Invalid HTML attr names | Use standard div attributes from reference |
