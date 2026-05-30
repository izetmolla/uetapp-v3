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
| `scripts/generate-render-cursor-docs.mjs` | Scaffold `.cursor/` AGENTS, rules, and skills per render folder |

## Per-render AI docs

| Render | `.cursor` path |
|--------|----------------|
| Alert Dialog | `renders/alert-dialog/.cursor/` |
| Avatar | `renders/avatar/.cursor/` |
| Badge | `renders/badge/.cursor/` |
| Breadcrumb | `renders/breadcrumb/.cursor/` |
| Button | `renders/button/.cursor/` |
| Button Group | `renders/button-group/.cursor/` |
| Calendar | `renders/calendar/.cursor/` |
| Card | `renders/card/.cursor/` |
| Checkbox | `renders/checkbox/.cursor/` |
| Collapsible | `renders/collapsible/.cursor/` |
| Combobox | `renders/combobox/.cursor/` |
| Command | `renders/command/.cursor/` |
| Content | `renders/content/.cursor/` |
| Dialog | `renders/dialog/.cursor/` |
| Div | `renders/div/.cursor/` |
| Dropdown Menu | `renders/dropdown-menu/.cursor/` |
| Form | `renders/form/.cursor/` |
| Icon | `renders/icon/.cursor/` |
| Input | `renders/input/.cursor/` |
| Input Group | `renders/input-group/.cursor/` |
| Item List | `renders/item-list/.cursor/` |
| Label | `renders/label/.cursor/` |
| Long Text | `renders/long-text/.cursor/` |
| Multi Select | `renders/multi-select/.cursor/` |
| Pagination | `renders/pagination/.cursor/` |
| Popover | `renders/popover/.cursor/` |
| Progress | `renders/progress/.cursor/` |
| Radio Group | `renders/radio-group/.cursor/` |
| Repeatable | `renders/repeatable/.cursor/` |
| Rs Async | `renders/rs-async/.cursor/` |
| Rs Creatable | `renders/rs-creatable/.cursor/` |
| Rs Fixed | `renders/rs-fixed/.cursor/` |
| Scroll Area | `renders/scroll-area/.cursor/` |
| Select | `renders/select/.cursor/` |
| Separator | `renders/separator/.cursor/` |
| Sheet | `renders/sheet/.cursor/` |
| Skeleton | `renders/skeleton/.cursor/` |
| Slider | `renders/slider/.cursor/` |
| Sonner | `renders/sonner/.cursor/` |
| Switch | `renders/switch/.cursor/` |
| Table | `renders/table/.cursor/` |
| Tabs | `renders/tabs/.cursor/` |
| Textarea | `renders/textarea/.cursor/` |
| Timeline | `renders/timeline/.cursor/` |
| Toggle | `renders/toggle/.cursor/` |
| Toggle Group | `renders/toggle-group/.cursor/` |
| Tooltip | `renders/tooltip/.cursor/` |

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
