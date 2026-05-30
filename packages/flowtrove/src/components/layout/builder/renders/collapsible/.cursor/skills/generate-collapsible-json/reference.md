# Collapsible — JSON reference

TypeScript: `renders/collapsible/types.ts`.

Registered manifest types: `collapsible`, `collapsible-trigger`, `collapsible-content`.

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

## CollapsibleItem (`type: "collapsible"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"collapsible"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |
| `open` | — |  |
| `triggerLabel` | — |  |

## CollapsibleTriggerItem (`type: "collapsible-trigger"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"collapsible-trigger"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |

## CollapsibleContentItem (`type: "collapsible-content"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"collapsible-content"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |


## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
