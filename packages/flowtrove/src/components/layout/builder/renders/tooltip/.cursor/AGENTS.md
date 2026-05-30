# Flowtrove Layout Builder — Tooltip render

Maps layout JSON (`tooltip`, `tooltip-trigger`, `tooltip-content`) to UI components via **LayoutBuilder**.

## Documentation map

| Doc | Use when |
|-----|----------|
| [skills/generate-tooltip-json/SKILL.md](skills/generate-tooltip-json/SKILL.md) | **Start here** — generate or validate JSON |
| [skills/generate-tooltip-json/reference.md](skills/generate-tooltip-json/reference.md) | Full prop schema |
| [skills/generate-tooltip-json/examples.md](skills/generate-tooltip-json/examples.md) | Copy-paste JSON patterns |
| [../../types/items.ts](../../types/items.ts) | `LayoutBuilderItem` union |
| [../manifest.ts](../manifest.ts) | Registered type strings |

## Source files

| Path | Role |
|------|------|
| `types.ts` | TypeScript schema source of truth |
| `index.tsx` | Renderer component(s) |
| [../../renders/registry.tsx](../../renders/registry.tsx) | Dispatch registration |

## Rules

- [rules/tooltip-render-core.mdc](rules/tooltip-render-core.mdc)

## MCP / AI output contract

1. Always set `type` + unique `id` on every item.
2. Valid types for this folder: `tooltip`, `tooltip-trigger`, `tooltip-content`.
3. Return strict JSON (no comments, no trailing commas).
4. Read `types.ts` before inventing new fields.
