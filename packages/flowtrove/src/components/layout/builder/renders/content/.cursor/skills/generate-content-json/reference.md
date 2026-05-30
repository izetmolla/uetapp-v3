# Content — JSON reference

TypeScript: `renders/content/types.ts`.

Registered manifest types: `content`.

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

## ContentItem (`type: "content"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"content"` | Discriminant |
| `id` | string | Unique identifier |
| `source` | — | Key on runtime `data`, or descriptor with optional HTTP load via TanStack Query. |
| `value` | — | Inline object when live `data[source]` is absent or not a plain object. |
| `objectName` | — | Name of the object in `{{ content.title }}` style bindings (default `"content"`). |
| `interpolation` | — | Override `LayoutBuilder` interpolation for this block's template only. |


## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
