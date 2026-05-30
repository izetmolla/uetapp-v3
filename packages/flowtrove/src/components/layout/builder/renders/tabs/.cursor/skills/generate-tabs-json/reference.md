# Tabs — JSON reference

TypeScript: `renders/tabs/types.ts`.

Registered manifest types: `tabs`, `tabs-list`, `tabs-trigger`, `tabs-content`.

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

## TabDef (`type: "?"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"tabs"` | Discriminant |
| `id` | string | Unique identifier |
| `value` | — |  |
| `label` | — |  |
| `children` | — |  |

## TabsItem (`type: "tabs"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"tabs"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |
| `tabs` | — |  |
| `defaultValue` | — |  |
| `orientation` | — |  |
| `listVariant` | — |  |

## TabsListItem (`type: "tabs-list"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"tabs-list"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |
| `variant` | — |  |

## TabsTriggerItem (`type: "tabs-trigger"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"tabs-trigger"` | Discriminant |
| `id` | string | Unique identifier |
| `value` | — |  |
| `text` | — |  |

## TabsContentItem (`type: "tabs-content"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"tabs-content"` | Discriminant |
| `id` | string | Unique identifier |
| `value` | — |  |
| `children` | — |  |


## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
