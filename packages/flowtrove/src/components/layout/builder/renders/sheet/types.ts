import type { BaseLayoutItem } from "../../types/base-layout";
import type { LayoutBuilderItem } from "../../types/items";

export type SheetItem = BaseLayoutItem & {
    type: "sheet";
    children?: LayoutBuilderItem[];
    trigger?: LayoutBuilderItem[];
    title?: string;
    description?: string;
    footer?: LayoutBuilderItem[];
    side?: "top" | "right" | "bottom" | "left";
    showCloseButton?: boolean;
    triggerClassName?: string;
    contentClassName?: string;
    headerClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    footerClassName?: string;
};

export type SheetTriggerItem = BaseLayoutItem & { type: "sheet-trigger"; children?: LayoutBuilderItem[] };
export type SheetContentItem = BaseLayoutItem & {
    type: "sheet-content";
    children?: LayoutBuilderItem[];
    side?: "top" | "right" | "bottom" | "left";
    showCloseButton?: boolean;
};
export type SheetHeaderItem = BaseLayoutItem & { type: "sheet-header"; children?: LayoutBuilderItem[] };
export type SheetTitleItem = BaseLayoutItem & { type: "sheet-title"; text: string };
export type SheetDescriptionItem = BaseLayoutItem & { type: "sheet-description"; text: string };
export type SheetFooterItem = BaseLayoutItem & { type: "sheet-footer"; children?: LayoutBuilderItem[] };
