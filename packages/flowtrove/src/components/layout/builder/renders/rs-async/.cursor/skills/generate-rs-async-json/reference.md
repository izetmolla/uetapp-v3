# Rs Async — JSON reference

TypeScript: `renders/rs-async/types.ts`.

Registered manifest types: `rs-async`.

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
| `type` | `"rs-async"` | Discriminant |
| `id` | string | Unique identifier |


## RsAsyncItem (`type: "rs-async"`)

Extends `BaseFormFieldItem` (requires `name` in forms).

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"rs-async"` | Discriminant |
| `id` | string | Unique identifier |
| `optionsApi` | — | Options API config (required for async remote search). |
| `loadOptionsUrl` | — | @deprecated Use `optionsApi`. Simple GET URL with `?search=` query param. |
| `options` | — | Static options for label lookup / defaultOptions seed. |
| `defaultOptions` | — | Default options: true = load on open, or initial option list. |


## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
