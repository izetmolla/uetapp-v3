# Sheet — JSON reference

TypeScript: `renders/sheet/types.ts`.

Registered manifest types: `sheet`, `sheet-trigger`, `sheet-content`, `sheet-header`, `sheet-title`, `sheet-description`, `sheet-footer`.

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

## SheetItem (`type: "sheet"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"sheet"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |
| `trigger` | — |  |
| `title` | — |  |
| `description` | — |  |
| `footer` | — |  |
| `side` | — |  |
| `showCloseButton` | — |  |
| `triggerClassName` | — |  |
| `contentClassName` | — |  |
| `headerClassName` | — |  |
| `titleClassName` | — |  |
| `descriptionClassName` | — |  |
| `footerClassName` | — |  |

## SheetTriggerItem (`type: "sheet-trigger"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"sheet-trigger"` | Discriminant |
| `id` | string | Unique identifier |


## SheetContentItem (`type: "sheet-content"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"sheet-content"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — |  |
| `side` | — |  |
| `showCloseButton` | — |  |

## SheetHeaderItem (`type: "sheet-header"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"sheet-header"` | Discriminant |
| `id` | string | Unique identifier |


## SheetTitleItem (`type: "sheet-title"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"sheet-title"` | Discriminant |
| `id` | string | Unique identifier |


## SheetDescriptionItem (`type: "sheet-description"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"sheet-description"` | Discriminant |
| `id` | string | Unique identifier |


## SheetFooterItem (`type: "sheet-footer"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"sheet-footer"` | Discriminant |
| `id` | string | Unique identifier |



## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
