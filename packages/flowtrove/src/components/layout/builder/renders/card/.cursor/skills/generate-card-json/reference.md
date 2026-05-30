# Card — JSON reference

Types in `types.ts`. All items extend `BaseLayoutItem` (`id`, `className`, `style`, `condition`, `locked`).

## CardItem (`type: "card"`)

| Field | Type | Mode | Description |
|-------|------|------|-------------|
| `size` | `"default"` \| `"sm"` | both | Root Card size |
| `children` | `LayoutBuilderItem[]` | both | Composed: slot items. Legacy: body in CardContent |
| `title` | string | legacy | CardTitle in CardHeader |
| `description` | string | legacy | CardDescription in CardHeader |
| `headerAction` | `LayoutBuilderItem[]` | legacy | CardAction in header (e.g. buttons) |
| `footer` | `LayoutBuilderItem[]` | legacy | CardFooter items |
| `contentClassName` | string | legacy | CardContent wrapper |
| `headerClassName` | string | legacy | CardHeader wrapper |
| `footerClassName` | string | legacy | CardFooter wrapper |
| `titleClassName` | string | legacy | CardTitle wrapper |
| `descriptionClassName` | string | legacy | CardDescription wrapper |
| `headerActionClassName` | string | legacy | CardAction wrapper |

## Mode detection (renderer)

Composed when `children` contains any top-level item with `type` in:
`card-header`, `card-content`, `card-footer`.

In composed mode, legacy props above are **ignored**.

## Slot items

| `type` | Required | Optional |
|--------|----------|----------|
| `card-header` | `id` | `children`, `className`, `style`, `condition` |
| `card-title` | `id`, `text` | `className`, `style`, `condition` |
| `card-description` | `id`, `text` | `className`, `style`, `condition` |
| `card-action` | `id` | `children`, `className`, `style`, `condition` |
| `card-content` | `id` | `children`, `paddingTopWhenNoHeader`, `className`, `style` |
| `card-footer` | `id` | `children`, `className`, `style`, `condition` |

## Renderer behavior

- **Legacy**: builds CardHeader from title/description/headerAction; children → CardContent; footer → CardFooter. Adds `pt-6` to content when no header.
- **Composed**: `<Card>` + `renderItems(children)` only.
- **card-content**: `paddingTopWhenNoHeader: true` adds `pt-6` class.

## Designer paths (legacy)

When `path` is set: `headerAction` → `[...path, -2]`, `footer` → `[...path, -1]`.
