# Form — JSON reference

TypeScript: `renders/form/types.ts`.

Registered manifest types: `form`.

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

## FormItem (`type: "form"`)

Extends `BaseLayoutItem`.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"form"` | Discriminant |
| `id` | string | Unique identifier |
| `children` | — | Form children |
| `name` | — | HTML `name` on the root form element (identifies the form in the document). |
| `formConfigKey` | — | Key from designer config.forms_fields to bind this form to; when set, field names are restricted to that config. |
| `source` | — | Key on layout `data` whose object pre-fills named fields (merged over JSON defaults). |
| `value` | — | Static values merged over field defaults when live `data[source]` is absent. |
| `action` | — | Form action URL |
| `method` | — | HTTP method |
| `encType` | — | Encoding type |
| `onSubmitAction` | — | Behaviour after submit |
| `redirectUrl` | — | Redirect URL (when onSubmitAction is "redirect") |
| `showSuccessToast` | — | Show success toast on submit |
| `successMessage` | — | Success toast message |
| `showErrorAsToast` | — | Show server/validation errors as toast instead of inline banner |


## Condition syntax

- Boolean path: `"data.isVisible"`
- Equality: `"data.status === 'active'"`
- Comparison: `"data.count > 5"`
