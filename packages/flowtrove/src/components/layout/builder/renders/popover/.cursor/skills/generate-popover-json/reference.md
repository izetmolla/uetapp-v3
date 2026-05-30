# Popover — JSON reference

TypeScript: `renders/popover/types.ts`.

Registered manifest types: `popover`, `popover-trigger`, `popover-content`.

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

## PopoverItem (`type: "popover"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"popover"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |
| `trigger` | — |  |

## PopoverTriggerItem (`type: "popover-trigger"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"popover-trigger"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |

## PopoverContentItem (`type: "popover-content"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"popover-content"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |


## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
