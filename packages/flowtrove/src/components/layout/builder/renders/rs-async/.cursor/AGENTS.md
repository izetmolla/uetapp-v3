# Flowtrove Layout Builder — Rs Async render

Maps layout JSON (`rs-async`) to UI components via **LayoutBuilder**.

## Documentation map

| Doc | Use when |
|-----|----------|
| [skills/generate-rs-async-json/SKILL.md](skills/generate-rs-async-json/SKILL.md) | **Start here** — generate or validate JSON |
| [skills/generate-rs-async-json/reference.md](skills/generate-rs-async-json/reference.md) | Full prop schema |
| [skills/generate-rs-async-json/examples.md](skills/generate-rs-async-json/examples.md) | Copy-paste JSON patterns |
| [../../types/items.ts](../../types/items.ts) | `LayoutBuilderItem` union |
| [../manifest.ts](../manifest.ts) | Registered type strings |

## Source files

| Path | Role |
|------|------|
| `types.ts` | TypeScript schema source of truth |
| `index.tsx` | Renderer component(s) |
| [../../renders/registry.tsx](../../renders/registry.tsx) | Dispatch registration |

## Rules

- [rules/rs-async-render-core.mdc](rules/rs-async-render-core.mdc)

## MCP / AI output contract

1. Always set `type` + unique `id` on every item.
2. Valid types for this folder: `rs-async`.
3. Return strict JSON (no comments, no trailing commas).
4. Read `types.ts` before inventing new fields.
6. Form fields require unique `name` inside a `form` item.
7. Use `validation` for Zod rules (see `lib/form/types.ts`).
