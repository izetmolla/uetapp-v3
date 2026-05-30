# Repeatable — JSON reference

TypeScript: `renders/repeatable/types.ts`.

Registered manifest types: `repeatable`.

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

## RepeatableFieldDef (`type: "input"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"input"` | Discriminant |
| `id` | string | Unique identifier |
| `name` | — |  |
| `label` | — |  |
| `placeholder` | — |  |
| `inputType` | — |  |
| `options` | — |  |

## RepeatableItem (`type: "repeatable"`)

Extends `BaseFormFieldItem` (requires `name` in forms).

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"repeatable"` | Discriminant |
| `id` | string | Unique identifier |
| `fields` | — | Column/field definitions for each row |
| `addButtonLabel` | — | Label for the "Add" button |


## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
