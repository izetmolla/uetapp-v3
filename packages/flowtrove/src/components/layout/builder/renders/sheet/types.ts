import type { BaseLayoutItem, LayoutBuilderChildItem } from "../../types/base-layout";

export type SheetItem = BaseLayoutItem & {
    type: "sheet";
    children?: LayoutBuilderChildItem[];
    trigger?: LayoutBuilderChildItem[];
    title?: string;
    description?: string;
    footer?: LayoutBuilderChildItem[];
    side?: "top" | "right" | "bottom" | "left";
    showCloseButton?: boolean;
    triggerClassName?: string;
    contentClassName?: string;
    headerClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    footerClassName?: string;
};

export type SheetTriggerItem = BaseLayoutItem & { type: "sheet-trigger"; children?: LayoutBuilderChildItem[] };
export type SheetContentItem = BaseLayoutItem & {
    type: "sheet-content";
    children?: LayoutBuilderChildItem[];
    side?: "top" | "right" | "bottom" | "left";
    showCloseButton?: boolean;
};
export type SheetHeaderItem = BaseLayoutItem & { type: "sheet-header"; children?: LayoutBuilderChildItem[] };
export type SheetTitleItem = BaseLayoutItem & { type: "sheet-title"; text: string };
export type SheetDescriptionItem = BaseLayoutItem & { type: "sheet-description"; text: string };
export type SheetFooterItem = BaseLayoutItem & { type: "sheet-footer"; children?: LayoutBuilderChildItem[] };
