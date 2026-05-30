# Flowtrove Layout Builder — Div render

Maps layout JSON (`type: "div"`) to a native HTML **`<div>`** container. Primary layout primitive for grouping, flex/grid, spacing.

## Documentation map

| Doc | Use when |
|-----|----------|
| [skills/generate-div-json/SKILL.md](skills/generate-div-json/SKILL.md) | **Start here** — generate or validate div JSON |
| [skills/generate-div-json/reference.md](skills/generate-div-json/reference.md) | Props, HTML attributes, nesting |
| [skills/generate-div-json/examples.md](skills/generate-div-json/examples.md) | Copy-paste patterns |
| [../../types/items.ts](../../types/items.ts) | `LayoutBuilderItem` union |

## Source files

| Path | Role |
|------|------|
| `types.ts` | `DivItem` — ContainerItem + HTML div attrs |
| `index.tsx` | `DivRenderer` |
| `../../renders/index.tsx` | Dispatches `type: "div"` |

## Rules

- [rules/div-render-core.mdc](rules/div-render-core.mdc)

## MCP / AI output contract

1. Always `type: "div"` + unique `id`.
2. Use `className` for Tailwind layout (flex, grid, gap, padding).
3. `children` holds nested layout items; use `[]` for empty containers.
4. Standard HTML div attributes allowed at top level (`role`, `aria-*`, `data-*`, `onClick` as string not supported — use button for actions).
5. Strict JSON only.
