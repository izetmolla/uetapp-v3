# Input — JSON reference

TypeScript: `renders/input/types.ts`.

Registered manifest types: `input`.

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

## InputType (`type: "?"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"input"` | Discriminant |
| `id` | string | Unique identifier |


## InputItem (`type: "input"`)

Extends `BaseFormFieldItem` (requires `name` in forms).

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"input"` | Discriminant |
| `id` | string | Unique identifier |
| `placeholder` | — |  |
| `inputType` | — |  |
| `required` | — |  |
| `inputId` | — |  |
| `invalid` | — |  |
| `defaultValue` | — |  |
| `labelClassName` | — |  |
| `descriptionClassName` | — |  |
| `size` | — |  |


## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
