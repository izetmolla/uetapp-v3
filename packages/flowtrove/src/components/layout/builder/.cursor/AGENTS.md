# Flowtrove Layout Builder — AI context

JSON item trees rendered by `<LayoutBuilder items={...} data={...} />`. Each `type` maps to a renderer under `renders/`.

## Documentation map

| Doc | Use when |
|-----|----------|
| [renders/manifest.ts](renders/manifest.ts) | All registered `type` strings |
| [renders/registry.tsx](renders/registry.tsx) | Dispatch map (lazy + sync bundles) |
| [renders/button/.cursor/skills/generate-button-json/SKILL.md](renders/button/.cursor/skills/generate-button-json/SKILL.md) | Button JSON |
| [types/items.ts](types/items.ts) | Full `LayoutBuilderItem` union (~70 types) |

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/generate-layout-renders.mjs` | Scaffold simple render folders |
| `scripts/generate-items-union.mjs` | Regenerate `types/items.ts` union from `renders/*/types.ts` |

## Per-render AI docs

| Render | `.cursor` path |
|--------|----------------|
| Button, Card, Dialog, Div | `renders/{name}/.cursor/` |

## Registered renders (summary)

| Category | Types |
|----------|-------|
| Layout | `div`, `scroll-area`, `button-group` |
| Display | `badge`, `label`, `avatar`, `icon`, `skeleton`, `progress`, `separator`, `long-text`, `toggle` |
| Form | `input`, `textarea`, `select`, `checkbox`, `switch`, `slider`, `radio-group`, `combobox`, `rs-fixed`, `rs-async`, `rs-creatable`, `repeatable` |
| Compound | `card`, `dialog`, `sheet`, `alert-dialog`, `tabs`, `collapsible`, `popover`, `tooltip` |
| Stub (extend) | `breadcrumb`, `pagination`, `dropdown-menu`, `command`, `input-group`, `timeline`, `calendar`, `sonner` |

## Rules

- [rules/layout-builder-core.mdc](rules/layout-builder-core.mdc)

## MCP output

- Emit strict JSON arrays of `LayoutBuilderItem`.
- Every item needs `type` + `id`.
- Form fields need `name` (`BaseFormFieldItem`).
- Compound components: legacy flat props **or** composed slot children — never mix (see card/dialog READMEs).
