# Dialog — JSON reference

Types in `types.ts`. All items extend `BaseLayoutItem`.

## DialogItem (`type: "dialog"`)

| Field | Type | Mode | Description |
|-------|------|------|-------------|
| `trigger` | `LayoutBuilderItem[]` | legacy | Wrapped in DialogTrigger |
| `children` | `LayoutBuilderItem[]` | both | Legacy: body. Composed: slot items |
| `title` | string | legacy | DialogTitle in DialogHeader |
| `description` | string | legacy | DialogDescription |
| `footer` | `LayoutBuilderItem[]` | legacy | DialogFooter |
| `showCloseButton` | boolean | legacy | DialogContent corner X (default true) |
| `triggerClassName` | string | legacy | DialogTrigger class |
| `contentClassName` | string | legacy | DialogContent class |
| `headerClassName` | string | legacy | DialogHeader class |
| `titleClassName` | string | legacy | DialogTitle class |
| `descriptionClassName` | string | legacy | DialogDescription class |
| `footerClassName` | string | legacy | DialogFooter class |

Root `className` / `style` → wrapper `<div>` around `<Dialog>`.

## Mode detection

Composed when `children` contains any top-level `dialog-trigger` or `dialog-content`. Legacy props ignored in composed mode.

## Slot items

| `type` | Required | Notable optional |
|--------|----------|------------------|
| `dialog-trigger` | `id` | `children`, `className` |
| `dialog-content` | `id` | `children`, `showCloseButton` (default true) |
| `dialog-header` | `id` | `children` |
| `dialog-title` | `id`, `text` | `className` |
| `dialog-description` | `id`, `text` | `className` |
| `dialog-footer` | `id` | `children`, `showCloseButton` (default false) |

## Renderer behavior (legacy)

- DialogTrigger wraps `trigger` items in `inline-flex` div (`asChild`).
- Header when `title` or `description` set; sr-only description fallbacks for a11y.
- Body: `children` inside DialogContent.
- Footer: optional `footer` array.
- Designer paths: trigger `0`, body `1`, footer `2`.

## Renderer behavior (composed)

- Wrapper div + `<Dialog>{renderItems(children)}</Dialog>`.
- Each slot renderer maps to shadcn/Radix component.
