# Rs Fixed — JSON reference

TypeScript: `renders/rs-fixed/types.ts`.

Registered manifest types: `rs-fixed`.

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

## RsOption (`type: "?"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"rs-fixed"` | Discriminant |
| `id` | string | Unique identifier |


## RsFixedItem (`type: "rs-fixed"`)

Extends `BaseFormFieldItem` (requires `name` in forms).

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"rs-fixed"` | Discriminant |
| `id` | string | Unique identifier |
| `onLoadFetch` | — | When true, fetch on mount; when false/ omitted, fetch on first menu open. |


## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
