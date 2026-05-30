# Flowtrove Layout Builder — Avatar render

Maps layout JSON (`avatar`) to UI components via **LayoutBuilder**.

## Documentation map

| Doc | Use when |
|-----|----------|
| [skills/generate-avatar-json/SKILL.md](skills/generate-avatar-json/SKILL.md) | **Start here** — generate or validate JSON |
| [skills/generate-avatar-json/reference.md](skills/generate-avatar-json/reference.md) | Full prop schema |
| [skills/generate-avatar-json/examples.md](skills/generate-avatar-json/examples.md) | Copy-paste JSON patterns |
| [../../types/items.ts](../../types/items.ts) | `LayoutBuilderItem` union |
| [../manifest.ts](../manifest.ts) | Registered type strings |

## Source files

| Path | Role |
|------|------|
| `types.ts` | TypeScript schema source of truth |
| `index.tsx` | Renderer component(s) |
| [../../renders/registry.tsx](../../renders/registry.tsx) | Dispatch registration |

## Rules

- [rules/avatar-render-core.mdc](rules/avatar-render-core.mdc)

## MCP / AI output contract

1. Always set `type` + unique `id` on every item.
2. Valid types for this folder: `avatar`.
3. Return strict JSON (no comments, no trailing commas).
4. Read `types.ts` before inventing new fields.
