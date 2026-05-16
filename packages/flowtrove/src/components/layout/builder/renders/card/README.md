# Card render

Maps layout JSON to the shadcn **Card** stack: root **Card**, optional **header** (title, description, action), **content**, and **footer**.

Implementation lives in this folder only:

- **`types.ts`** — `CardItem` plus slot item types (`CardHeaderItem`, `CardTitleItem`, …) included in `LayoutBuilderItem`.
- **`index.tsx`** — default export **`CardRenderer`** for `type: "card"`, and named exports **`CardHeaderRenderer`**, **`CardTitleRenderer`**, **`CardDescriptionRenderer`**, **`CardActionRenderer`**, **`CardContentRenderer`**, **`CardFooterRenderer`** for nested slot types.

`../index.tsx` registers all of these via `import * as CardRenderers from "./card"` (synchronous chunk: any card-related type pulls in this module once).

## Table of contents

- [Two layout modes](#two-layout-modes)
- [Composed mode (slot children)](#composed-mode-slot-children)
- [Legacy mode (flat props)](#legacy-mode-flat-props)
- [Slot item reference](#slot-item-reference)
- [Examples](#examples)

## Two layout modes

### Composed mode

If **`children`** contains **any** top-level item whose `type` is **`card-header`**, **`card-content`**, or **`card-footer`**, the card is rendered in **composed** mode:

- The root renders `<Card>` and **`renderItems(children)`** only.
- Order and structure are entirely defined by those slot items (and their own `children`).
- Legacy flat props on **`CardItem`** (`title`, `description`, `footer`, `headerAction`, …) are **not** used in this branch.

### Legacy mode

If there is **no** such top-level slot in **`children`**, the card uses the **legacy** flat API:

- Optional header built from **`title`**, **`description`**, and **`headerAction`**.
- Main body from **`children`** inside **CardContent** (with `pt-6` on content when there is no header).
- Optional **`footer`** array rendered in **CardFooter**.
- Designer paths: **`headerAction`** uses `path` suffix `-2`, **`footer`** uses `-1` when `path` is defined.

## Composed mode (slot children)

Typical order inside **`card.children`**:

1. **`card-header`** — usually contains **`card-title`**, **`card-description`**, and/or **`card-action`**.
2. **`card-content`** — main body (any layout items).
3. **`card-footer`** (optional).

Nested slot types are only meaningful **inside** a card tree; the layout renderer dispatches them by `type` like any other item.

## Legacy mode (flat props)

| Prop | Type | Description |
|------|------|-------------|
| `size` | `"default"` \| `"sm"` | Passed to the root **Card**. |
| `title` | `string` | Rendered in **CardTitle** inside **CardHeader**. |
| `description` | `string` | Rendered in **CardDescription** inside **CardHeader**. |
| `children` | `LayoutBuilderItem[]` | Main content inside **CardContent**. |
| `footer` | `LayoutBuilderItem[]` | Footer slot. |
| `headerAction` | `LayoutBuilderItem[]` | e.g. buttons, rendered in **CardAction** in the header. |
| `contentClassName` | `string` | **CardContent** wrapper. |
| `headerClassName` | `string` | **CardHeader** wrapper. |
| `footerClassName` | `string` | **CardFooter** wrapper. |
| `titleClassName` | `string` | **CardTitle** wrapper. |
| `descriptionClassName` | `string` | **CardDescription** wrapper. |
| `headerActionClassName` | `string` | **CardAction** wrapper. |

Plus standard **`BaseLayoutItem`** fields: `id`, `type`, `className`, `style`, `condition`, `locked`, …

## Slot item reference

| `type` | Props | Role |
|--------|--------|------|
| `card-header` | `children?` | **CardHeader**; nest title / description / action. |
| `card-title` | `text` (required) | **CardTitle**. |
| `card-description` | `text` (required) | **CardDescription**. |
| `card-action` | `children?` | **CardAction**; usually buttons. |
| `card-content` | `children?`, `paddingTopWhenNoHeader?` | **CardContent**; optional `paddingTopWhenNoHeader` adds `pt-6` when you have no header sibling. |
| `card-footer` | `children?` | **CardFooter**. |

All slot items support `className`, `style`, and other **`BaseLayoutItem`** fields where applicable.

## Examples

### Legacy — simple

```json
{
  "type": "card",
  "id": "card-1",
  "title": "Card title",
  "description": "Card description.",
  "children": [
    {
      "type": "div",
      "id": "card-1-body",
      "className": "text-sm text-muted-foreground",
      "children": []
    }
  ]
}
```

### Legacy — header action and footer

```json
{
  "type": "card",
  "id": "card-2",
  "className": "w-full max-w-sm",
  "size": "sm",
  "title": "Settings",
  "description": "Manage your preferences.",
  "headerAction": [
    {
      "type": "button",
      "id": "card-2-edit",
      "label": "Edit",
      "variant": "ghost",
      "size": "sm"
    }
  ],
  "children": [
    {
      "type": "div",
      "id": "card-2-main",
      "className": "space-y-2",
      "children": []
    }
  ],
  "footer": [
    {
      "type": "button",
      "id": "card-2-save",
      "label": "Save",
      "variant": "default"
    },
    {
      "type": "button",
      "id": "card-2-cancel",
      "label": "Cancel",
      "variant": "outline"
    }
  ]
}
```

### Composed — explicit slots

```json
{
  "type": "card",
  "id": "card-3",
  "className": "max-w-md",
  "size": "default",
  "children": [
    {
      "type": "card-header",
      "id": "card-3-h",
      "children": [
        { "type": "card-title", "id": "card-3-t", "text": "Title" },
        { "type": "card-description", "id": "card-3-d", "text": "Description" },
        {
          "type": "card-action",
          "id": "card-3-a",
          "children": [
            {
              "type": "button",
              "id": "card-3-btn",
              "label": "Action",
              "action": "example"
            }
          ]
        }
      ]
    },
    {
      "type": "card-content",
      "id": "card-3-c",
      "children": [
        {
          "type": "div",
          "id": "card-3-inner",
          "className": "text-sm",
          "children": []
        }
      ]
    },
    {
      "type": "card-footer",
      "id": "card-3-f",
      "children": [
        {
          "type": "button",
          "id": "card-3-ok",
          "label": "OK",
          "variant": "default"
        }
      ]
    }
  ]
}
```

If the composed tree has **no** `card-header`, you can set **`paddingTopWhenNoHeader`: true** on the **`card-content`** item to mimic legacy top padding.
