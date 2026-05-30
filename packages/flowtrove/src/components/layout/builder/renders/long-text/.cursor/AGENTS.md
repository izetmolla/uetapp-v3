# Flowtrove Layout Builder — Long Text render

Maps layout JSON (`long-text`) to UI components via **LayoutBuilder**.

## Documentation map

| Doc | Use when |
|-----|----------|
| [skills/generate-long-text-json/SKILL.md](skills/generate-long-text-json/SKILL.md) | **Start here** — generate or validate JSON |
| [skills/generate-long-text-json/reference.md](skills/generate-long-text-json/reference.md) | Full prop schema |
| [skills/generate-long-text-json/examples.md](skills/generate-long-text-json/examples.md) | Copy-paste JSON patterns |
| [../../types/items.ts](../../types/items.ts) | `LayoutBuilderItem` union |
| [../manifest.ts](../manifest.ts) | Registered type strings |

## Source files

| Path | Role |
|------|------|
| `types.ts` | TypeScript schema source of truth |
| `index.tsx` | Renderer component(s) |
| [../../renders/registry.tsx](../../renders/registry.tsx) | Dispatch registration |

## Rules

- [rules/long-text-render-core.mdc](rules/long-text-render-core.mdc)

## MCP / AI output contract

1. Always set `type` + unique `id` on every item.
2. Valid types for this folder: `long-text`.
3. Return strict JSON (no comments, no trailing commas).
4. Read `types.ts` before inventing new fields.
