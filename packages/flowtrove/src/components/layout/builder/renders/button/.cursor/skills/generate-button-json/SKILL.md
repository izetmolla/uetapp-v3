---
name: generate-button-json
description: >-
  Generates and validates Flowtrove layout builder JSON for type "button": shadcn
  variants, sizes, actions, conditions, and nesting in dialogs/cards/divs. Use when
  building layout JSON, MCP layout tools, or adding buttons to LayoutBuilder trees.
---

# Generate button layout JSON

Produces valid `ButtonItem` objects for `LayoutBuilder`. Schema source: `types.ts`. Parent context: `../../types/items.ts` (`BaseLayoutItem`, `LayoutBuilderItem`).

---

## Quick checklist

```
- [ ] 1. Set type: "button" and unique id
- [ ] 2. Add label (simple) OR children (complex content)
- [ ] 3. Pick variant/size if not default
- [ ] 4. Set buttonType: "submit" for form primary actions
- [ ] 5. Add action + actionParams when click should dispatch an event
- [ ] 6. Add condition if visibility depends on data
- [ ] 7. Nest inside appropriate parent (div, dialog-trigger, card-footer, …)
```

---

## Minimal template

```json
{
  "type": "button",
  "id": "btn-save",
  "label": "Save",
  "variant": "default",
  "action": "save"
}
```

---

## Field guide (essentials)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | Always `"button"` |
| `id` | yes | Unique in tree; designer selection key |
| `label` | usually | Plain text label; skipped when `children` non-empty |
| `children` | optional | `LayoutBuilderItem[]` rendered inside button |
| `variant` | no | shadcn: default, destructive, outline, secondary, ghost, link |
| `size` | no | default, sm, lg, icon |
| `buttonType` | no | submit, button, reset → native `<button type>` |
| `disabled` | no | boolean |
| `action` | no | Event name for parent `onAction` handler |
| `actionParams` | no | `{ "key": "value" }` passed with action |
| `className` | no | Tailwind classes on button |
| `condition` | no | Hide when false (see reference) |

Full list: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Common patterns

**Dialog open trigger** — nest under `dialog-trigger` or legacy `dialog.trigger`:

```json
{ "type": "button", "id": "dlg-open", "label": "Open", "variant": "outline", "action": "noop" }
```

**Form submit**:

```json
{ "type": "button", "id": "form-submit", "label": "Submit", "buttonType": "submit", "variant": "default" }
```

**Destructive confirm**:

```json
{ "type": "button", "id": "delete", "label": "Delete", "variant": "destructive", "action": "delete", "actionParams": { "confirm": true } }
```

**Conditional**:

```json
{ "type": "button", "id": "edit", "label": "Edit", "condition": "data.isEditable === true", "action": "edit" }
```

---

## Output rules (MCP / agents)

1. Output **only JSON** when asked for a button item (single object or array inside a parent).
2. Use **stable, descriptive ids** (`btn-save`, `dlg-1-cancel`, not `b1`).
3. Do **not** emit `icon` / `iconPosition` until renderer supports them.
4. Prefer `label` over empty `children: []`.
5. Use `"action": "noop"` for purely presentational triggers (e.g. Radix dialog) when no app handler exists yet.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Used `"type": "submit"` | Use `"buttonType": "submit"`; `type` is always `"button"` |
| Missing label and empty children | Add `label` or meaningful `children` |
| Invalid variant | Stick to enum in reference.md |
| Button as dialog root | Wrap in `dialog-trigger` or use legacy `dialog.trigger` array |
| Icon in JSON | Not rendered yet — use label text only |
