# Toggle Group — JSON reference

TypeScript: `renders/toggle-group/types.ts`.

Registered manifest types: `toggle-group`, `toggle-group-item`.

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

## ToggleGroupLayoutItem (`type: "toggle-group"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"toggle-group"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |
| `groupType` | — |  |
| `defaultValue` | — |  |
| `variant` | — |  |
| `size` | — |  |

## ToggleGroupMemberItem (`type: "toggle-group-item"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"toggle-group-item"` | Discriminant |
| `id` | string | Unique identifier |
| `value` | — |  |
| `text` | — |  |


## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
