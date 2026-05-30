"use client";

import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { LayoutBuilderItem } from "../types/items";
import type { LayoutRendererProps } from "../types";
import * as CardRenderers from "./card";
import * as DialogRenderers from "./dialog";
import * as SheetRenderers from "./sheet";
import * as AlertDialogRenderers from "./alert-dialog";
import * as TabsRenderers from "./tabs";
import * as CollapsibleRenderers from "./collapsible";
import * as PopoverRenderers from "./popover";
import * as TooltipRenderers from "./tooltip";
import * as TableRenderers from "./table";
import * as ToggleGroupRenderers from "./toggle-group";
import { ContentRenderer } from "./content";
import { ItemListRenderer } from "./item-list";

type Renderer = ComponentType<LayoutRendererProps<LayoutBuilderItem>>;
type LazyRenderer = LazyExoticComponent<ComponentType<LayoutRendererProps<LayoutBuilderItem>>>;

/** Wrap static lazy imports — Vite requires literal paths, not template dynamic imports. */
function lazyRenderer(importFn: () => Promise<{ default: unknown }>): LazyRenderer {
    return lazy(
        importFn as () => Promise<{ default: ComponentType<LayoutRendererProps<LayoutBuilderItem>> }>,
    );
}

/** Lazy-loaded single-export renderers */
const LAZY: Record<string, LazyRenderer> = {
    div: lazyRenderer(() => import("./div")),
    button: lazyRenderer(() => import("./button")),
    select: lazyRenderer(() => import("./select")),
    badge: lazyRenderer(() => import("./badge")),
    label: lazyRenderer(() => import("./label")),
    separator: lazyRenderer(() => import("./separator")),
    skeleton: lazyRenderer(() => import("./skeleton")),
    progress: lazyRenderer(() => import("./progress")),
    avatar: lazyRenderer(() => import("./avatar")),
    icon: lazyRenderer(() => import("./icon")),
    "long-text": lazyRenderer(() => import("./long-text")),
    toggle: lazyRenderer(() => import("./toggle")),
    input: lazyRenderer(() => import("./input")),
    textarea: lazyRenderer(() => import("./textarea")),
    checkbox: lazyRenderer(() => import("./checkbox")),
    switch: lazyRenderer(() => import("./switch")),
    slider: lazyRenderer(() => import("./slider")),
    "radio-group": lazyRenderer(() => import("./radio-group")),
    combobox: lazyRenderer(() => import("./combobox")),
    "multi-select": lazyRenderer(() => import("./multi-select")),
    "rs-fixed": lazyRenderer(() => import("./rs-fixed")),
    "rs-async": lazyRenderer(() => import("./rs-async")),
    "rs-creatable": lazyRenderer(() => import("./rs-creatable")),
    repeatable: lazyRenderer(() => import("./repeatable")),
    "scroll-area": lazyRenderer(() => import("./scroll-area")),
    "button-group": lazyRenderer(() => import("./button-group")),
    calendar: lazyRenderer(() => import("./calendar")),
    breadcrumb: lazyRenderer(() => import("./breadcrumb")),
    pagination: lazyRenderer(() => import("./pagination")),
    "dropdown-menu": lazyRenderer(() => import("./dropdown-menu")),
    command: lazyRenderer(() => import("./command")),
    form: lazyRenderer(() => import("./form")),
    "input-group": lazyRenderer(() => import("./input-group")),
    timeline: lazyRenderer(() => import("./timeline")),
    sonner: lazyRenderer(() => import("./sonner")),
};

/** Sync compound bundles (multiple exports per module) */
const SYNC: Record<string, Renderer> = {
    card: CardRenderers.default as Renderer,
    "card-header": CardRenderers.CardHeaderRenderer as Renderer,
    "card-title": CardRenderers.CardTitleRenderer as Renderer,
    "card-description": CardRenderers.CardDescriptionRenderer as Renderer,
    "card-action": CardRenderers.CardActionRenderer as Renderer,
    "card-content": CardRenderers.CardContentRenderer as Renderer,
    "card-footer": CardRenderers.CardFooterRenderer as Renderer,
    dialog: DialogRenderers.default as Renderer,
    "dialog-trigger": DialogRenderers.DialogTriggerRenderer as Renderer,
    "dialog-content": DialogRenderers.DialogContentRenderer as Renderer,
    "dialog-header": DialogRenderers.DialogHeaderRenderer as Renderer,
    "dialog-title": DialogRenderers.DialogTitleRenderer as Renderer,
    "dialog-description": DialogRenderers.DialogDescriptionRenderer as Renderer,
    "dialog-footer": DialogRenderers.DialogFooterRenderer as Renderer,
    sheet: SheetRenderers.default as Renderer,
    "sheet-trigger": SheetRenderers.SheetTriggerRenderer as Renderer,
    "sheet-content": SheetRenderers.SheetContentRenderer as Renderer,
    "sheet-header": SheetRenderers.SheetHeaderRenderer as Renderer,
    "sheet-title": SheetRenderers.SheetTitleRenderer as Renderer,
    "sheet-description": SheetRenderers.SheetDescriptionRenderer as Renderer,
    "sheet-footer": SheetRenderers.SheetFooterRenderer as Renderer,
    "alert-dialog": AlertDialogRenderers.default as Renderer,
    "alert-dialog-trigger": AlertDialogRenderers.AlertDialogTriggerRenderer as Renderer,
    "alert-dialog-content": AlertDialogRenderers.AlertDialogContentRenderer as Renderer,
    "alert-dialog-header": AlertDialogRenderers.AlertDialogHeaderRenderer as Renderer,
    "alert-dialog-title": AlertDialogRenderers.AlertDialogTitleRenderer as Renderer,
    "alert-dialog-description": AlertDialogRenderers.AlertDialogDescriptionRenderer as Renderer,
    "alert-dialog-footer": AlertDialogRenderers.AlertDialogFooterRenderer as Renderer,
    tabs: TabsRenderers.default as Renderer,
    "tabs-list": TabsRenderers.TabsListRenderer as Renderer,
    "tabs-trigger": TabsRenderers.TabsTriggerRenderer as Renderer,
    "tabs-content": TabsRenderers.TabsContentRenderer as Renderer,
    collapsible: CollapsibleRenderers.default as Renderer,
    "collapsible-trigger": CollapsibleRenderers.CollapsibleTriggerRenderer as Renderer,
    "collapsible-content": CollapsibleRenderers.CollapsibleContentRenderer as Renderer,
    popover: PopoverRenderers.default as Renderer,
    "popover-trigger": PopoverRenderers.PopoverTriggerRenderer as Renderer,
    "popover-content": PopoverRenderers.PopoverContentRenderer as Renderer,
    tooltip: TooltipRenderers.default as Renderer,
    "tooltip-trigger": TooltipRenderers.TooltipTriggerRenderer as Renderer,
    "tooltip-content": TooltipRenderers.TooltipContentRenderer as Renderer,
    table: TableRenderers.default as Renderer,
    "table-header": TableRenderers.TableHeaderRenderer as Renderer,
    "table-body": TableRenderers.TableBodyRenderer as Renderer,
    "table-row": TableRenderers.TableRowRenderer as Renderer,
    "table-head": TableRenderers.TableHeadRenderer as Renderer,
    "table-cell": TableRenderers.TableCellRenderer as Renderer,
    "table-footer": TableRenderers.TableFooterRenderer as Renderer,
    "toggle-group": ToggleGroupRenderers.default as Renderer,
    "toggle-group-item": ToggleGroupRenderers.ToggleGroupMemberRenderer as Renderer,
    content: ContentRenderer as Renderer,
    "item-list": ItemListRenderer as Renderer,
};

export function getRenderer(type: string): Renderer | LazyRenderer | undefined {
    return SYNC[type] ?? LAZY[type];
}

export function isLazyRenderer(type: string): boolean {
    return type in LAZY;
}

export const REGISTERED_RENDER_TYPES = [...Object.keys(SYNC), ...Object.keys(LAZY)];
