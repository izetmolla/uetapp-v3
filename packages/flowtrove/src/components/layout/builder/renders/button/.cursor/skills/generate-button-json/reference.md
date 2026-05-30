# ButtonItem — JSON reference

TypeScript: `renders/button/types.ts`. Extends `BaseLayoutItem` + `ContainerItem` from `types/items.ts`.

## BaseLayoutItem (all layout items)

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Discriminant; `"button"` for buttons |
| `id` | string | Unique identifier |
| `className` | string? | Tailwind / CSS classes |
| `style` | object? | Inline CSS properties |
| `condition` | string? | Expression against `LayoutBuilder` `data`; item hidden when false |
| `locked` | boolean? | Designer-only; prevents edits in canvas |

### Condition syntax

Evaluated by `evaluateCondition` in `lib/utils.ts`:

- Boolean path: `"data.isVisible"`, `"data.user.canEdit"`
- Equality: `"data.status === 'active'"`, `"data.count === 0"`
- Comparison: `"data.count > 5"`, `"data.level >= 2"`

Prefix with `data.` or use bare paths (both work for simple paths).

## ButtonItem fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | `"button"` | — | Required discriminant |
| `label` | string | — | Button text when no children |
| `buttonType` | `"submit"` \| `"button"` \| `"reset"` | `"button"` | Native HTML button type |
| `variant` | see below | `"default"` | shadcn Button variant |
| `size` | see below | `"default"` | shadcn Button size |
| `icon` | string? | — | Lucide icon name (**not rendered yet**) |
| `iconPosition` | `"left"` \| `"right"`? | — | (**not rendered yet**) |
| `disabled` | boolean? | `false` | Disables interaction |
| `action` | string? | — | Action event name for `onAction` |
| `actionParams` | `Record<string, unknown>`? | — | Payload merged into action detail |
| `children` | `LayoutBuilderItem[]`? | `[]` | Nested items; when non-empty, replaces `label` |

### variant enum

| Value | Use case |
|-------|----------|
| `default` | Primary action |
| `destructive` | Delete, irreversible actions |
| `outline` | Secondary / cancel |
| `secondary` | Alternate emphasis |
| `ghost` | Low emphasis, toolbars |
| `link` | Text link styling |

### size enum

| Value | Use case |
|-------|----------|
| `default` | Standard buttons |
| `sm` | Compact UI, tables, footers |
| `lg` | Prominent CTAs |
| `icon` | Icon-only (square); pair with label or children when icon support lands |

## Renderer behavior (`index.tsx`)

- Spreads `variant`, `size`, `disabled`, etc. to shadcn `<Button>`.
- Maps `buttonType` → native `type` attribute.
- Appends `cursor-pointer` via `className`.
- Renders `renderItems(children)` when `children.length > 0`, else `label`.
- `action` / `actionParams` reserved for future click handler; not attached in current renderer.

## LayoutBuilderItem placement

Buttons commonly appear as:

| Parent | Role |
|--------|------|
| `div` | Generic layout / button groups |
| `dialog` → `trigger` (legacy) | Open modal |
| `dialog-trigger` → `children` | Composed dialog open |
| `dialog-footer` → `children` | Modal actions |
| `card-footer` / `card-action` | Card actions |
| `card` → `footer` / `headerAction` (legacy) | Card actions |

## JSON schema (informal)

```json
{
  "type": "button",
  "id": "string",
  "label": "string",
  "buttonType": "submit | button | reset",
  "variant": "default | destructive | outline | secondary | ghost | link",
  "size": "default | sm | lg | icon",
  "disabled": false,
  "action": "string",
  "actionParams": {},
  "className": "string",
  "condition": "string",
  "children": []
}
```
