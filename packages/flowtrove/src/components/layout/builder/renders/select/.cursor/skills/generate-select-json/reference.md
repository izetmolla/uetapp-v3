# Select — JSON reference

TypeScript: `renders/select/types.ts`.

Registered manifest types: `select`.

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

## SelectOption (`type: "?"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"select"` | Discriminant |
| `id` | string | Unique identifier |


## SelectItem (`type: "select"`)

Extends `BaseFormFieldItem` (requires `name` in forms).

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"select"` | Discriminant |
| `id` | string | Unique identifier |
| `placeholder` | — | Placeholder when nothing selected. |
| `defaultValue` | — | Default / initial value. |
| `fetchOptions` | — | @deprecated Prefer object-form `options`. Kept for backward compatibility. |
| `replaceOptions` | — | When true, fetched options replace static options. |
| `size` | — | SelectTrigger size. |
| `clearable` | — | Show clear control on trigger. |


## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
