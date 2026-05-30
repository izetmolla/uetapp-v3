# Flowtrove Layout Builder — Alert Dialog render

Maps layout JSON (`alert-dialog`, `alert-dialog-trigger`, `alert-dialog-content`, `alert-dialog-header`, `alert-dialog-title`, `alert-dialog-description`, `alert-dialog-footer`) to UI components via **LayoutBuilder**.

## Documentation map

| Doc | Use when |
|-----|----------|
| [skills/generate-alert-dialog-json/SKILL.md](skills/generate-alert-dialog-json/SKILL.md) | **Start here** — generate or validate JSON |
| [skills/generate-alert-dialog-json/reference.md](skills/generate-alert-dialog-json/reference.md) | Full prop schema |
| [skills/generate-alert-dialog-json/examples.md](skills/generate-alert-dialog-json/examples.md) | Copy-paste JSON patterns |
| [../../types/items.ts](../../types/items.ts) | `LayoutBuilderItem` union |
| [../manifest.ts](../manifest.ts) | Registered type strings |

## Source files

| Path | Role |
|------|------|
| `types.ts` | TypeScript schema source of truth |
| `index.tsx` | Renderer component(s) |
| [../../renders/registry.tsx](../../renders/registry.tsx) | Dispatch registration |

## Rules

- [rules/alert-dialog-render-core.mdc](rules/alert-dialog-render-core.mdc)

## MCP / AI output contract

1. Always set `type` + unique `id` on every item.
2. Valid types for this folder: `alert-dialog`, `alert-dialog-trigger`, `alert-dialog-content`, `alert-dialog-header`, `alert-dialog-title`, `alert-dialog-description`, `alert-dialog-footer`.
3. Return strict JSON (no comments, no trailing commas).
4. Read `types.ts` before inventing new fields.
