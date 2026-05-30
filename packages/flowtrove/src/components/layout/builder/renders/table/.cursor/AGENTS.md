# Flowtrove Layout Builder — Table render

Maps layout JSON (`table`, `table-header`, `table-body`, `table-row`, `table-head`, `table-cell`, `table-footer`) to UI components via **LayoutBuilder**.

## Documentation map

| Doc | Use when |
|-----|----------|
| [skills/generate-table-json/SKILL.md](skills/generate-table-json/SKILL.md) | **Start here** — generate or validate JSON |
| [skills/generate-table-json/reference.md](skills/generate-table-json/reference.md) | Full prop schema |
| [skills/generate-table-json/examples.md](skills/generate-table-json/examples.md) | Copy-paste JSON patterns |
| [../../types/items.ts](../../types/items.ts) | `LayoutBuilderItem` union |
| [../manifest.ts](../manifest.ts) | Registered type strings |

## Source files

| Path | Role |
|------|------|
| `types.ts` | TypeScript schema source of truth |
| `index.tsx` | Renderer component(s) |
| [../../renders/registry.tsx](../../renders/registry.tsx) | Dispatch registration |

## Rules

- [rules/table-render-core.mdc](rules/table-render-core.mdc)

## MCP / AI output contract

1. Always set `type` + unique `id` on every item.
2. Valid types for this folder: `table`, `table-header`, `table-body`, `table-row`, `table-head`, `table-cell`, `table-footer`.
3. Return strict JSON (no comments, no trailing commas).
4. Read `types.ts` before inventing new fields.
