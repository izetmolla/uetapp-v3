# Rs Creatable — JSON reference

TypeScript: `renders/rs-creatable/types.ts`.

Registered manifest types: `rs-creatable`.

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
| `type` | `"rs-creatable"` | Discriminant |
| `id` | string | Unique identifier |


## RsCreatableItem (`type: "rs-creatable"`)

Extends `BaseFormFieldItem` (requires `name` in forms).

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"rs-creatable"` | Discriminant |
| `id` | string | Unique identifier |
| `onLoadFetch` | — | When true (default), fetch on mount when `optionsApi` is set. |
| `onCreateConfigAPI` | — | API config for persisting a newly created option. |


## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
