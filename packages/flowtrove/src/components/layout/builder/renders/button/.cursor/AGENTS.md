# Flowtrove Layout Builder — Button render

Maps layout JSON (`type: "button"`) to the shadcn **Button** component. Used inside **LayoutBuilder** trees (dialogs, cards, divs, forms).

## Documentation map

| Doc | Use when |
|-----|----------|
| [skills/generate-button-json/SKILL.md](skills/generate-button-json/SKILL.md) | **Start here** — generate or validate button JSON |
| [skills/generate-button-json/reference.md](skills/generate-button-json/reference.md) | Full prop schema, enums, base fields |
| [skills/generate-button-json/examples.md](skills/generate-button-json/examples.md) | Copy-paste JSON patterns |
| [../../types/items.ts](../../types/items.ts) | `LayoutBuilderItem` union, `BaseLayoutItem` |
| [../dialog/README.md](../dialog/README.md) | Buttons as dialog triggers / footer actions |
| [../card/README.md](../card/README.md) | Buttons in card header action / footer |

## Source files

| Path | Role |
|------|------|
| `types.ts` | `ButtonItem` — JSON schema source of truth |
| `index.tsx` | `ButtonRenderer` — maps JSON → shadcn `<Button>` |
| `../../renders/index.tsx` | Dispatches `type: "button"` to lazy renderer |
| `../../LayoutBuilder.tsx` | Root component; accepts `items: LayoutBuilderItem[]` |

## Rules

- [rules/button-render-core.mdc](rules/button-render-core.mdc) — schema, JSON generation, renderer edits

## MCP / AI output contract

When generating button JSON:

1. Always set `"type": "button"` and a unique `"id"`.
2. Prefer `"label"` for simple text; use `"children"` only when the button needs nested layout items.
3. Use shadcn enum values for `variant` and `size` (see reference).
4. Place buttons in parent containers (`div`, `dialog-trigger`, `card-footer`, etc.) — not as root-only orphans unless the page is a single control.
5. Return valid JSON (no comments, no trailing commas).
