# Flowtrove Layout Builder — Separator render

Maps layout JSON (`separator`) to UI components via **LayoutBuilder**.

## Documentation map

| Doc | Use when |
|-----|----------|
| [skills/generate-separator-json/SKILL.md](skills/generate-separator-json/SKILL.md) | **Start here** — generate or validate JSON |
| [skills/generate-separator-json/reference.md](skills/generate-separator-json/reference.md) | Full prop schema |
| [skills/generate-separator-json/examples.md](skills/generate-separator-json/examples.md) | Copy-paste JSON patterns |
| [../../types/items.ts](../../types/items.ts) | `LayoutBuilderItem` union |
| [../manifest.ts](../manifest.ts) | Registered type strings |

## Source files

| Path | Role |
|------|------|
| `types.ts` | TypeScript schema source of truth |
| `index.tsx` | Renderer component(s) |
| [../../renders/registry.tsx](../../renders/registry.tsx) | Dispatch registration |

## Rules

- [rules/separator-render-core.mdc](rules/separator-render-core.mdc)

## MCP / AI output contract

1. Always set `type` + unique `id` on every item.
2. Valid types for this folder: `separator`.
3. Return strict JSON (no comments, no trailing commas).
4. Read `types.ts` before inventing new fields.
