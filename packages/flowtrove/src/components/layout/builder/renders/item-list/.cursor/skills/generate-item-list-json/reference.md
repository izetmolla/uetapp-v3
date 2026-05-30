# Item List — JSON reference

TypeScript: `renders/item-list/types.ts`.

Registered manifest types: `item-list`.

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

## ItemListItem (`type: "item-list"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"item-list"` | Discriminant |
| `id` | string | Unique identifier |
| `source` | — | Key on `LayoutBuilder` runtime `data` for the array to iterate. |
| `list` | — | Static rows (e.g. designer preview) when live `data[source]` is missing or empty. |
| `itemName` | — | Binding name for the row object in `{{ }}` scope (default `"item"`). |
| `interpolation` | — | Override `LayoutBuilder` interpolation for this list's row template only. |


## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
