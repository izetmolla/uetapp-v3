# Flowtrove Layout Builder — AI context

JSON item trees rendered by `<LayoutBuilder items={...} data={...} />`. Each `type` maps to a renderer under `renders/`.

## Documentation map

| Doc | Use when |
|-----|----------|
| [renders/button/.cursor/skills/generate-button-json/SKILL.md](renders/button/.cursor/skills/generate-button-json/SKILL.md) | Generate button JSON |
| [renders/card/.cursor/skills/generate-card-json/SKILL.md](renders/card/.cursor/skills/generate-card-json/SKILL.md) | Generate card JSON |
| [renders/dialog/.cursor/skills/generate-dialog-json/SKILL.md](renders/dialog/.cursor/skills/generate-dialog-json/SKILL.md) | Generate dialog JSON |
| [renders/div/.cursor/skills/generate-div-json/SKILL.md](renders/div/.cursor/skills/generate-div-json/SKILL.md) | Generate div JSON |
| [types/items.ts](types/items.ts) | `LayoutBuilderItem` union |

## Package layout

| Path | Role |
|------|------|
| `LayoutBuilder.tsx` | Root; `items`, `data`, `interpolation` |
| `LayoutBuilderContext.tsx` | Shared context for renderers |
| `renders/index.tsx` | Type → renderer dispatch |
| `types/items.ts` | Item type union |
| `lib/utils.ts` | `condition` evaluation, keys |

## Per-render AI docs

| Render | `.cursor` path | Skill name |
|--------|----------------|------------|
| Button | `renders/button/.cursor/` | `generate-button-json` |
| Card | `renders/card/.cursor/` | `generate-card-json` |
| Dialog | `renders/dialog/.cursor/` | `generate-dialog-json` |
| Div | `renders/div/.cursor/` | `generate-div-json` |

## Rules

- [rules/layout-builder-core.mdc](rules/layout-builder-core.mdc)

## MCP output

- Emit strict JSON arrays of `LayoutBuilderItem`.
- Every item needs `type` + `id`.
- Use render-specific skills for prop enums and mode rules (legacy vs composed for card/dialog).
- Typical page: root `div` → `card`(s) / `dialog`(s) with nested `button` items.
