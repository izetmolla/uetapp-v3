# Flowtrove Layout Builder — Form render

Maps layout JSON (`form`) to UI components via **LayoutBuilder**.

## Documentation map

| Doc | Use when |
|-----|----------|
| [skills/generate-form-json/SKILL.md](skills/generate-form-json/SKILL.md) | **Start here** — generate or validate JSON |
| [skills/generate-form-json/reference.md](skills/generate-form-json/reference.md) | Full prop schema |
| [skills/generate-form-json/examples.md](skills/generate-form-json/examples.md) | Copy-paste JSON patterns |
| [../../types/items.ts](../../types/items.ts) | `LayoutBuilderItem` union |
| [../manifest.ts](../manifest.ts) | Registered type strings |

## Source files

| Path | Role |
|------|------|
| `types.ts` | TypeScript schema source of truth |
| `index.tsx` | Renderer component(s) |
| [../../renders/registry.tsx](../../renders/registry.tsx) | Dispatch registration |

## Rules

- [rules/form-render-core.mdc](rules/form-render-core.mdc)

## MCP / AI output contract

1. Always set `type` + unique `id` on every item.
2. Valid types for this folder: `form`.
3. Return strict JSON (no comments, no trailing commas).
4. Read `types.ts` before inventing new fields.
