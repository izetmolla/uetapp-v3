# Flowtrove Layout Builder — Input Group render

Maps layout JSON (`input-group`) to UI components via **LayoutBuilder**.

## Documentation map

| Doc | Use when |
|-----|----------|
| [skills/generate-input-group-json/SKILL.md](skills/generate-input-group-json/SKILL.md) | **Start here** — generate or validate JSON |
| [skills/generate-input-group-json/reference.md](skills/generate-input-group-json/reference.md) | Full prop schema |
| [skills/generate-input-group-json/examples.md](skills/generate-input-group-json/examples.md) | Copy-paste JSON patterns |
| [../../types/items.ts](../../types/items.ts) | `LayoutBuilderItem` union |
| [../manifest.ts](../manifest.ts) | Registered type strings |

## Source files

| Path | Role |
|------|------|
| `types.ts` | TypeScript schema source of truth |
| `index.tsx` | Renderer component(s) |
| [../../renders/registry.tsx](../../renders/registry.tsx) | Dispatch registration |

## Rules

- [rules/input-group-render-core.mdc](rules/input-group-render-core.mdc)

## MCP / AI output contract

1. Always set `type` + unique `id` on every item.
2. Valid types for this folder: `input-group`.
3. Return strict JSON (no comments, no trailing commas).
4. Read `types.ts` before inventing new fields.
