/**
 * Layout builder render manifest — maps JSON `type` strings to UI packages.
 * Used by registry and code generation.
 */

export type RenderManifestEntry = {
    /** Folder name under renders/ */
    folder: string;
    /** JSON type discriminant */
    type: string;
    /** Lazy-load as default export from index.tsx */
    lazy?: boolean;
    /** Named export from index.tsx (compound slot renderers) */
    namedExport?: string;
    /** Included in FormFieldItem union */
    formField?: boolean;
};

/** Root + slot renderers registered in the dispatch map. */
export const RENDER_MANIFEST: RenderManifestEntry[] = [
    // Existing (registered explicitly in registry for sync/lazy mix)
    { folder: "div", type: "div", lazy: true },
    { folder: "form", type: "form", lazy: true },
    { folder: "button", type: "button", lazy: true },
    { folder: "select", type: "select", lazy: true, formField: true },
    { folder: "repeatable", type: "repeatable", formField: true },
    { folder: "content", type: "content" },
    { folder: "item-list", type: "item-list" },

    // Card (sync bundle)
    { folder: "card", type: "card" },
    { folder: "card", type: "card-header", namedExport: "CardHeaderRenderer" },
    { folder: "card", type: "card-title", namedExport: "CardTitleRenderer" },
    { folder: "card", type: "card-description", namedExport: "CardDescriptionRenderer" },
    { folder: "card", type: "card-action", namedExport: "CardActionRenderer" },
    { folder: "card", type: "card-content", namedExport: "CardContentRenderer" },
    { folder: "card", type: "card-footer", namedExport: "CardFooterRenderer" },

    // Dialog (sync bundle)
    { folder: "dialog", type: "dialog" },
    { folder: "dialog", type: "dialog-trigger", namedExport: "DialogTriggerRenderer" },
    { folder: "dialog", type: "dialog-content", namedExport: "DialogContentRenderer" },
    { folder: "dialog", type: "dialog-header", namedExport: "DialogHeaderRenderer" },
    { folder: "dialog", type: "dialog-title", namedExport: "DialogTitleRenderer" },
    { folder: "dialog", type: "dialog-description", namedExport: "DialogDescriptionRenderer" },
    { folder: "dialog", type: "dialog-footer", namedExport: "DialogFooterRenderer" },

    // Simple / leaf
    { folder: "badge", type: "badge", lazy: true },
    { folder: "label", type: "label", lazy: true },
    { folder: "separator", type: "separator", lazy: true },
    { folder: "skeleton", type: "skeleton", lazy: true },
    { folder: "progress", type: "progress", lazy: true },
    { folder: "avatar", type: "avatar", lazy: true },
    { folder: "icon", type: "icon", lazy: true },
    { folder: "long-text", type: "long-text", lazy: true },
    { folder: "toggle", type: "toggle", lazy: true },

    // Form fields
    { folder: "input", type: "input", lazy: true, formField: true },
    { folder: "textarea", type: "textarea", lazy: true, formField: true },
    { folder: "checkbox", type: "checkbox", lazy: true, formField: true },
    { folder: "switch", type: "switch", lazy: true, formField: true },
    { folder: "slider", type: "slider", lazy: true, formField: true },
    { folder: "radio-group", type: "radio-group", lazy: true, formField: true },
    { folder: "combobox", type: "combobox", lazy: true, formField: true },
    { folder: "multi-select", type: "multi-select", lazy: true, formField: true },
    { folder: "rs-fixed", type: "rs-fixed", lazy: true, formField: true },
    { folder: "rs-async", type: "rs-async", lazy: true, formField: true },
    { folder: "rs-creatable", type: "rs-creatable", lazy: true, formField: true },

    // Compound — tabs
    { folder: "tabs", type: "tabs", lazy: true },
    { folder: "tabs", type: "tabs-list", lazy: true, namedExport: "TabsListRenderer" },
    { folder: "tabs", type: "tabs-trigger", lazy: true, namedExport: "TabsTriggerRenderer" },
    { folder: "tabs", type: "tabs-content", lazy: true, namedExport: "TabsContentRenderer" },

    // Compound — sheet
    { folder: "sheet", type: "sheet", lazy: true },
    { folder: "sheet", type: "sheet-trigger", lazy: true, namedExport: "SheetTriggerRenderer" },
    { folder: "sheet", type: "sheet-content", lazy: true, namedExport: "SheetContentRenderer" },
    { folder: "sheet", type: "sheet-header", lazy: true, namedExport: "SheetHeaderRenderer" },
    { folder: "sheet", type: "sheet-title", lazy: true, namedExport: "SheetTitleRenderer" },
    { folder: "sheet", type: "sheet-description", lazy: true, namedExport: "SheetDescriptionRenderer" },
    { folder: "sheet", type: "sheet-footer", lazy: true, namedExport: "SheetFooterRenderer" },

    // Compound — alert-dialog
    { folder: "alert-dialog", type: "alert-dialog", lazy: true },
    { folder: "alert-dialog", type: "alert-dialog-trigger", lazy: true, namedExport: "AlertDialogTriggerRenderer" },
    { folder: "alert-dialog", type: "alert-dialog-content", lazy: true, namedExport: "AlertDialogContentRenderer" },
    { folder: "alert-dialog", type: "alert-dialog-header", lazy: true, namedExport: "AlertDialogHeaderRenderer" },
    { folder: "alert-dialog", type: "alert-dialog-title", lazy: true, namedExport: "AlertDialogTitleRenderer" },
    { folder: "alert-dialog", type: "alert-dialog-description", lazy: true, namedExport: "AlertDialogDescriptionRenderer" },
    { folder: "alert-dialog", type: "alert-dialog-footer", lazy: true, namedExport: "AlertDialogFooterRenderer" },

    // Compound — collapsible
    { folder: "collapsible", type: "collapsible", lazy: true },
    { folder: "collapsible", type: "collapsible-trigger", lazy: true, namedExport: "CollapsibleTriggerRenderer" },
    { folder: "collapsible", type: "collapsible-content", lazy: true, namedExport: "CollapsibleContentRenderer" },

    // Compound — popover
    { folder: "popover", type: "popover", lazy: true },
    { folder: "popover", type: "popover-trigger", lazy: true, namedExport: "PopoverTriggerRenderer" },
    { folder: "popover", type: "popover-content", lazy: true, namedExport: "PopoverContentRenderer" },

    // Compound — tooltip
    { folder: "tooltip", type: "tooltip", lazy: true },
    { folder: "tooltip", type: "tooltip-trigger", lazy: true, namedExport: "TooltipTriggerRenderer" },
    { folder: "tooltip", type: "tooltip-content", lazy: true, namedExport: "TooltipContentRenderer" },

    // Compound — scroll-area
    { folder: "scroll-area", type: "scroll-area", lazy: true },

    // Compound — button-group
    { folder: "button-group", type: "button-group", lazy: true },
    { folder: "button-group", type: "button-group-separator", lazy: true, namedExport: "ButtonGroupSeparatorRenderer" },
    { folder: "button-group", type: "button-group-text", lazy: true, namedExport: "ButtonGroupTextRenderer" },

    // Compound — toggle-group
    { folder: "toggle-group", type: "toggle-group", lazy: true },
    { folder: "toggle-group", type: "toggle-group-item", lazy: true, namedExport: "ToggleGroupItemRenderer" },

    // Compound — table
    { folder: "table", type: "table", lazy: true },
    { folder: "table", type: "table-header", lazy: true, namedExport: "TableHeaderRenderer" },
    { folder: "table", type: "table-body", lazy: true, namedExport: "TableBodyRenderer" },
    { folder: "table", type: "table-row", lazy: true, namedExport: "TableRowRenderer" },
    { folder: "table", type: "table-head", lazy: true, namedExport: "TableHeadRenderer" },
    { folder: "table", type: "table-cell", lazy: true, namedExport: "TableCellRenderer" },
    { folder: "table", type: "table-footer", lazy: true, namedExport: "TableFooterRenderer" },

    // Other
    { folder: "calendar", type: "calendar", lazy: true },
    { folder: "breadcrumb", type: "breadcrumb", lazy: true },
    { folder: "pagination", type: "pagination", lazy: true },
    { folder: "dropdown-menu", type: "dropdown-menu", lazy: true },
    { folder: "command", type: "command", lazy: true },
    { folder: "input-group", type: "input-group", lazy: true },
    { folder: "timeline", type: "timeline", lazy: true },
    { folder: "sonner", type: "sonner", lazy: true },
];

/** Unique render folders (one index.tsx per folder). */
export const RENDER_FOLDERS = [...new Set(RENDER_MANIFEST.map((e) => e.folder))];
