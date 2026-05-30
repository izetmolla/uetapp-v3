# Flowtrove Layout Builder — Card render

Maps layout JSON to the shadcn **Card** stack: root **Card**, optional **header** (title, description, action), **content**, and **footer**.

## Documentation map

| Doc | Use when |
|-----|----------|
| [skills/generate-card-json/SKILL.md](skills/generate-card-json/SKILL.md) | **Start here** — generate or validate card JSON |
| [skills/generate-card-json/reference.md](skills/generate-card-json/reference.md) | Full prop schema, slot types, mode detection |
| [skills/generate-card-json/examples.md](skills/generate-card-json/examples.md) | Copy-paste JSON patterns |
| [../README.md](../README.md) | Human-readable card docs |
| [../../types/items.ts](../../types/items.ts) | `LayoutBuilderItem` union |
| [../button/.cursor/skills/generate-button-json/SKILL.md](../button/.cursor/skills/generate-button-json/SKILL.md) | Buttons in header/footer slots |

## Source files

| Path | Role |
|------|------|
| `types.ts` | `CardItem` + slot types (`card-header`, `card-title`, …) |
| `index.tsx` | `CardRenderer` + slot renderers |
| `../../renders/index.tsx` | Dispatches `card` and `card-*` types |

## Rules

- [rules/card-render-core.mdc](rules/card-render-core.mdc)

## MCP / AI output contract

1. Choose **legacy** (flat `title`/`footer`) or **composed** (slot children) — never mix on the same card.
2. Composed mode activates when `children` contains any top-level `card-header`, `card-content`, or `card-footer`.
3. Every item needs `type` + unique `id`.
4. Slot types `card-title` / `card-description` require `text` (not `label`).
5. Return strict JSON (no comments, no trailing commas).
