# Div — JSON reference

TypeScript: `types.ts`. `DivItem = ContainerItem & DivElementProperties & { type: "div" }`.

## Core fields

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"div"` | Required discriminant |
| `id` | string | Unique identifier |
| `children` | `LayoutBuilderItem[]` | Nested items |
| `className` | string | CSS / Tailwind classes |
| `style` | object | Inline CSS properties |
| `condition` | string | Hide when false (see button skill / `lib/utils.ts`) |
| `locked` | boolean | Designer-only |

## HTML div attributes

Any valid `HTMLAttributes<HTMLDivElement>` except `children` may appear at the top level:

| Category | Examples |
|----------|----------|
| ARIA | `role`, `aria-label`, `aria-labelledby`, `aria-hidden` |
| Data | `data-testid`, `data-state` |
| Identity | `id` (also layout id), `title` |
| Focus | `tabIndex` |

Spread onto native `<div>` via renderer.

## Legacy / internal

| Field | Notes |
|-------|-------|
| `props` | Nested object merged onto DOM before other attrs — prefer flat attrs for new JSON |
| `styleType` | Designer legacy — stripped at dispatch, do not generate |
| `locked` | Stripped before renderer spread |

## Renderer behavior

- Renders `<div {...divProps} className={cn(className, designerOutline?)}>`.
- Designer mode (`path` defined): adds dashed outline + `min-h-10`.
- Recursively renders `children` via `renderItems`.

## Nesting

Div is the default container for:

- Page sections and columns
- Dialog/card body content
- Button groups (`flex gap-2`)
- Form field groups (future form renderers)

## Informal schema

```json
{
  "type": "div",
  "id": "string",
  "className": "string",
  "style": {},
  "condition": "string",
  "role": "string",
  "aria-label": "string",
  "data-testid": "string",
  "children": []
}
```
