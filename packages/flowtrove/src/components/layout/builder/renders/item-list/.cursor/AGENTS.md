# Flowtrove Layout Builder — Item List render

Maps layout JSON (`item-list`) to UI components via **LayoutBuilder**.

## Documentation map

| Doc | Use when |
|-----|----------|
| [skills/generate-item-list-json/SKILL.md](skills/generate-item-list-json/SKILL.md) | **Start here** — generate or validate JSON |
| [skills/generate-item-list-json/reference.md](skills/generate-item-list-json/reference.md) | Full prop schema |
| [skills/generate-item-list-json/examples.md](skills/generate-item-list-json/examples.md) | Copy-paste JSON patterns |
| [../../types/items.ts](../../types/items.ts) | `LayoutBuilderItem` union |
| [../manifest.ts](../manifest.ts) | Registered type strings |

## Source files

| Path | Role |
|------|------|
| `types.ts` | TypeScript schema source of truth |
| `index.tsx` | Renderer component(s) |
| [../../renders/registry.tsx](../../renders/registry.tsx) | Dispatch registration |

## Rules

- [rules/item-list-render-core.mdc](rules/item-list-render-core.mdc)

## MCP / AI output contract

1. Always set `type` + unique `id` on every item.
2. Valid types for this folder: `item-list`.
3. Return strict JSON (no comments, no trailing commas).
4. Read `types.ts` before inventing new fields.
