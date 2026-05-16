# Dialog render

Maps layout JSON to the shadcn **Dialog** (Radix modal): root **Dialog**, **DialogTrigger**, **DialogContent**, optional **header** / **title** / **description**, body, and **footer**.

Implementation lives in this folder:

- **`types.ts`** — `DialogItem` plus slot item types (`DialogTriggerItem`, `DialogContentItem`, …) included in `LayoutBuilderItem`.
- **`index.tsx`** — default export **`DialogRenderer`** for `type: "dialog"`, and named exports for each slot renderer.

`../index.tsx` registers them via `import * as DialogRenderers from "./dialog"` (same pattern as **card**).

The Radix **Dialog** root does not render a DOM node, so **`className`** / **`style`** on a **`dialog`** item are applied on a wrapping **`<div>`** around **`<Dialog>`** so layout styling still works.

## Table of contents

- [Two layout modes](#two-layout-modes)
- [Composed mode (slot children)](#composed-mode-slot-children)
- [Legacy mode (flat props)](#legacy-mode-flat-props)
- [Slot item reference](#slot-item-reference)
- [Examples](#examples)

## Two layout modes

### Composed mode

If **`children`** contains any item with `type` **`dialog-trigger`** or **`dialog-content`**, the dialog is rendered in **composed** mode:

- A wrapper **`<div>`** (for `className` / `style` on the dialog item) wraps **`<Dialog>`**.
- **`renderItems(children)`** only — structure comes from slot items (usually **`dialog-trigger`** then **`dialog-content`**).
- Legacy flat props on **`DialogItem`** (`trigger`, `title`, `footer`, …) are **not** used in this branch.

### Legacy mode

If neither top-level slot appears in **`children`**, the dialog uses the **legacy** flat API:

- **`trigger`** — items wrapped in **DialogTrigger** (designer path suffix `0`).
- **DialogContent** with optional header from **`title`** / **`description`**, same sr-only fallbacks as before.
- Body from **`children`** (path suffix `1`).
- Optional **`footer`** (path suffix `2`).

## Composed mode (slot children)

Typical **`dialog.children`** order:

1. **`dialog-trigger`** — opens the dialog (e.g. nested **button** items).
2. **`dialog-content`** — modal panel; its **`children`** often include **`dialog-header`** (with **`dialog-title`** / **`dialog-description`**), arbitrary body items, and optional **`dialog-footer`**.

## Legacy mode (flat props)

| Prop | Type | Description |
|------|------|-------------|
| `trigger` | `LayoutBuilderItem[]` | Items for **DialogTrigger** (often a button). |
| `children` | `LayoutBuilderItem[]` | Main content inside **DialogContent**. |
| `title` | `string` | **DialogTitle** (inside **DialogHeader** when header exists). |
| `description` | `string` | **DialogDescription**. |
| `footer` | `LayoutBuilderItem[]` | **DialogFooter** slot. |
| `showCloseButton` | `boolean` | **DialogContent** corner close control (default `true`). |
| `triggerClassName` | `string` | Passed to **DialogTrigger**. |
| `contentClassName` | `string` | **DialogContent** wrapper. |
| `headerClassName` | `string` | **DialogHeader** wrapper. |
| `titleClassName` | `string` | **DialogTitle** wrapper. |
| `descriptionClassName` | `string` | **DialogDescription** wrapper. |
| `footerClassName` | `string` | **DialogFooter** wrapper. |

Plus standard **`BaseLayoutItem`** fields (`id`, `className`, `style`, `condition`, …).

## Slot item reference

| `type` | Props | Role |
|--------|--------|------|
| `dialog-trigger` | `children?` | **DialogTrigger** + inner flex wrapper. |
| `dialog-content` | `children?`, `showCloseButton?` | **DialogContent** (default `showCloseButton: true`). |
| `dialog-header` | `children?` | **DialogHeader**. |
| `dialog-title` | `text` (required) | **DialogTitle**. |
| `dialog-description` | `text` (required) | **DialogDescription**. |
| `dialog-footer` | `children?`, `showCloseButton?` | **DialogFooter** (shadcn optional footer close; default `false`). |

## Examples

### Legacy — simple

```json
{
  "type": "dialog",
  "id": "dlg-1",
  "trigger": [
    { "type": "button", "id": "dlg-1-open", "label": "Open dialog", "action": "noop" }
  ],
  "title": "Dialog",
  "children": [
    {
      "type": "div",
      "id": "dlg-1-body",
      "className": "text-sm text-muted-foreground",
      "children": []
    }
  ]
}
```

### Legacy — with footer

```json
{
  "type": "dialog",
  "id": "dlg-2",
  "trigger": [
    { "type": "button", "id": "dlg-2-open", "label": "Open", "variant": "outline", "action": "noop" }
  ],
  "title": "Confirm",
  "description": "This action cannot be undone.",
  "showCloseButton": true,
  "children": [
    { "type": "div", "id": "dlg-2-msg", "className": "text-sm", "children": [] }
  ],
  "footer": [
    { "type": "button", "id": "dlg-2-cancel", "label": "Cancel", "variant": "outline", "action": "noop" },
    { "type": "button", "id": "dlg-2-ok", "label": "Confirm", "variant": "default", "action": "noop" }
  ]
}
```

### Composed — explicit slots

```json
{
  "type": "dialog",
  "id": "dlg-3",
  "className": "inline-block",
  "children": [
    {
      "type": "dialog-trigger",
      "id": "dlg-3-tr",
      "children": [
        {
          "type": "button",
          "id": "dlg-3-btn",
          "label": "Open",
          "variant": "outline",
          "action": "noop"
        }
      ]
    },
    {
      "type": "dialog-content",
      "id": "dlg-3-co",
      "showCloseButton": true,
      "children": [
        {
          "type": "dialog-header",
          "id": "dlg-3-h",
          "children": [
            { "type": "dialog-title", "id": "dlg-3-t", "text": "Title" },
            { "type": "dialog-description", "id": "dlg-3-d", "text": "Description" }
          ]
        },
        {
          "type": "div",
          "id": "dlg-3-body",
          "className": "text-sm",
          "children": []
        },
        {
          "type": "dialog-footer",
          "id": "dlg-3-f",
          "children": [
            {
              "type": "button",
              "id": "dlg-3-close",
              "label": "Close",
              "variant": "outline",
              "action": "noop"
            }
          ]
        }
      ]
    }
  ]
}
```
