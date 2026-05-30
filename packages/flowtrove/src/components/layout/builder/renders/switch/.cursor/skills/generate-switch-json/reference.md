# Switch — JSON reference

TypeScript: `renders/switch/types.ts`.

Registered manifest types: `switch`.

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

## SwitchItem (`type: "switch"`)

Extends `BaseFormFieldItem` (requires `name` in forms).

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"switch"` | Discriminant |
| `id` | string | Unique identifier |
| `checked` | — |  |
| `defaultChecked` | — |  |
| `required` | — |  |
| `invalid` | — |  |
| `size` | — |  |


## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
