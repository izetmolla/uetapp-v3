---
name: generate-dialog-json
description: >-
  Generates and validates Flowtrove layout builder JSON for dialog types (dialog,
  dialog-trigger, dialog-content, dialog-header, etc.): legacy flat props vs composed
  slot mode. Use when building modals, MCP layout tools, or confirm/delete dialogs.
---

# Generate dialog layout JSON

Produces valid `DialogItem` and slot objects for `LayoutBuilder`. Schema: `types.ts`.

---

## Quick checklist

```
- [ ] 1. Choose legacy OR composed mode
- [ ] 2. Set type: "dialog" and unique id
- [ ] 3. Add trigger (legacy trigger[] or composed dialog-trigger)
- [ ] 4. Add title/description (legacy strings or dialog-title/description slots)
- [ ] 5. Add body in children (legacy) or inside dialog-content (composed)
- [ ] 6. Optional footer with cancel/confirm buttons
- [ ] 7. Trigger buttons: action "noop" for Radix-only open
```

---

## Mode decision

| Use legacy | Use composed |
|------------|--------------|
| Simple confirm modal | Custom slot structure |
| Flat title + footer arrays | Multiple dialogs with shared patterns |
| MCP one-shot modals | Designer slot trees |

**Composed triggers when** `children` contains `dialog-trigger` or `dialog-content`.

---

## Minimal templates

**Legacy confirm:**

```json
{
  "type": "dialog",
  "id": "dlg-confirm",
  "trigger": [
    { "type": "button", "id": "dlg-open", "label": "Delete", "variant": "destructive", "action": "noop" }
  ],
  "title": "Confirm delete",
  "description": "This cannot be undone.",
  "children": [],
  "footer": [
    { "type": "button", "id": "dlg-cancel", "label": "Cancel", "variant": "outline", "action": "noop" },
    { "type": "button", "id": "dlg-ok", "label": "Delete", "variant": "destructive", "action": "delete" }
  ]
}
```

**Composed:**

```json
{
  "type": "dialog",
  "id": "dlg-1",
  "className": "inline-block",
  "children": [
    {
      "type": "dialog-trigger",
      "id": "dlg-1-tr",
      "children": [
        { "type": "button", "id": "dlg-1-btn", "label": "Open", "variant": "outline", "action": "noop" }
      ]
    },
    {
      "type": "dialog-content",
      "id": "dlg-1-co",
      "showCloseButton": true,
      "children": [
        {
          "type": "dialog-header",
          "id": "dlg-1-h",
          "children": [
            { "type": "dialog-title", "id": "dlg-1-t", "text": "Title" },
            { "type": "dialog-description", "id": "dlg-1-d", "text": "Description" }
          ]
        }
      ]
    }
  ]
}
```

Full schema: [reference.md](reference.md). Patterns: [examples.md](examples.md).

---

## Slot types

| `type` | Key props |
|--------|-----------|
| `dialog-trigger` | `children?` — usually a button |
| `dialog-content` | `children?`, `showCloseButton?` (default true) |
| `dialog-header` | `children?` |
| `dialog-title` | `text` (required) |
| `dialog-description` | `text` (required) |
| `dialog-footer` | `children?`, `showCloseButton?` (default false) |

---

## Output rules (MCP / agents)

1. Always include a way to open the dialog (trigger).
2. Never mix legacy `trigger` with composed slot children on same dialog.
3. Footer cancel/close buttons: `variant: "outline"`, `action: "noop"`.
4. Root `className` styles the wrapper div, not the modal panel — use `contentClassName` (legacy) or `dialog-content.className` (composed).

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Dialog won't open | Add trigger button inside `dialog-trigger` or legacy `trigger` |
| Used `label` on dialog-title | Use `text` |
| Styled wrong element | Panel styling → `contentClassName` or `dialog-content.className` |
| Mixed modes | Remove legacy props when using composed slots |
