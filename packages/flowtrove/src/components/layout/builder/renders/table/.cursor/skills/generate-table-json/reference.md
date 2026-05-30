# Table — JSON reference

TypeScript: `renders/table/types.ts`.

Registered manifest types: `table`, `table-header`, `table-body`, `table-row`, `table-head`, `table-cell`, `table-footer`.

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

## TableItem (`type: "table"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"table"` | Discriminant |
| `id` | string | Unique identifier |


## TableHeaderItem (`type: "table-header"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"table-header"` | Discriminant |
| `id` | string | Unique identifier |


## TableBodyItem (`type: "table-body"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"table-body"` | Discriminant |
| `id` | string | Unique identifier |


## TableRowItem (`type: "table-row"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"table-row"` | Discriminant |
| `id` | string | Unique identifier |


## TableHeadItem (`type: "table-head"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"table-head"` | Discriminant |
| `id` | string | Unique identifier |


## TableCellItem (`type: "table-cell"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"table-cell"` | Discriminant |
| `id` | string | Unique identifier |


## TableFooterItem (`type: "table-footer"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"table-footer"` | Discriminant |
| `id` | string | Unique identifier |



## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
