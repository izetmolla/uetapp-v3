# Alert Dialog — JSON reference

TypeScript: `renders/alert-dialog/types.ts`.

Registered manifest types: `alert-dialog`, `alert-dialog-trigger`, `alert-dialog-content`, `alert-dialog-header`, `alert-dialog-title`, `alert-dialog-description`, `alert-dialog-footer`.

## BaseLayoutItem (all layout items)

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Discriminant |
| `id` | string | Unique identifier |
| `className` | string? | Tailwind classes |
| `style` | object? | Inline CSS |
| `condition` | string? | Hide when false (evaluated against `data`) |
| `locked` | boolean? | Designer-only |

## BaseFormFieldItem (form fields)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | react-hook-form field key |
| `label` | string? | Visible label |
| `description` | string? | Help text |
| `validation` | object? | Zod rules — see `lib/form/types.ts` |
| `disabled` | boolean? | Disable input |

## AlertDialogItem (`type: "alert-dialog"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"alert-dialog"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |
| `trigger` | — |  |
| `title` | — |  |
| `description` | — |  |
| `footer` | — |  |
| `size` | — |  |

## AlertDialogTriggerItem (`type: "alert-dialog-trigger"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"alert-dialog-trigger"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |

## AlertDialogContentItem (`type: "alert-dialog-content"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"alert-dialog-content"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |
| `size` | — |  |

## AlertDialogHeaderItem (`type: "alert-dialog-header"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"alert-dialog-header"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |

## AlertDialogTitleItem (`type: "alert-dialog-title"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"alert-dialog-title"` | Discriminant |
| `id` | string | Unique identifier |


## AlertDialogDescriptionItem (`type: "alert-dialog-description"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"alert-dialog-description"` | Discriminant |
| `id` | string | Unique identifier |
| `text` | — |  |

## AlertDialogFooterItem (`type: "alert-dialog-footer"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"alert-dialog-footer"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |


## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
