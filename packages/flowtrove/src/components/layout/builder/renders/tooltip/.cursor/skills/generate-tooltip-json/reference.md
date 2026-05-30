# Tooltip — JSON reference

TypeScript: `renders/tooltip/types.ts`.

Registered manifest types: `tooltip`, `tooltip-trigger`, `tooltip-content`.

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

## TooltipItem (`type: "tooltip"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"tooltip"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |
| `content` | — |  |

## TooltipTriggerItem (`type: "tooltip-trigger"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"tooltip-trigger"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |

## TooltipContentItem (`type: "tooltip-content"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"tooltip-content"` | Discriminant |
| `id` | string | Unique identifier |
| `text` | — |  |


## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
