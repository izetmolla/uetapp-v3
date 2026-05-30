# Flowtrove Layout Builder — Dialog render

Maps layout JSON to shadcn **Dialog** (Radix modal): **DialogTrigger**, **DialogContent**, header/title/description, body, footer.

## Documentation map

| Doc | Use when |
|-----|----------|
| [skills/generate-dialog-json/SKILL.md](skills/generate-dialog-json/SKILL.md) | **Start here** — generate or validate dialog JSON |
| [skills/generate-dialog-json/reference.md](skills/generate-dialog-json/reference.md) | Full prop schema, slot types, mode detection |
| [skills/generate-dialog-json/examples.md](skills/generate-dialog-json/examples.md) | Copy-paste JSON patterns |
| [../README.md](../README.md) | Human-readable dialog docs |
| [../button/.cursor/skills/generate-button-json/SKILL.md](../button/.cursor/skills/generate-button-json/SKILL.md) | Trigger and footer buttons |

## Source files

| Path | Role |
|------|------|
| `types.ts` | `DialogItem` + slot types |
| `index.tsx` | `DialogRenderer` + slot renderers |
| `../../renders/index.tsx` | Dispatches `dialog` and `dialog-*` types |

## Rules

- [rules/dialog-render-core.mdc](rules/dialog-render-core.mdc)

## MCP / AI output contract

1. Choose **legacy** (`trigger`, `title`, `footer`) or **composed** (`dialog-trigger`, `dialog-content` slots).
2. Composed mode when `children` contains `dialog-trigger` or `dialog-content`.
3. Trigger buttons use `"action": "noop"` unless app handles the event (Radix opens on click).
4. `className`/`style` on `dialog` apply to wrapper `<div>` (Radix root has no DOM node).
5. Strict JSON only.
