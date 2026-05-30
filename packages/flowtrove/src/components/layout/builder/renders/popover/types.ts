import type { BaseLayoutItem } from "../../types/base-layout";
import type { LayoutBuilderItem } from "../../types/items";

export type PopoverItem = BaseLayoutItem & {
    type: "popover";
    children?: LayoutBuilderItem[];
    trigger?: LayoutBuilderItem[];
};

export type PopoverTriggerItem = BaseLayoutItem & {
    type: "popover-trigger";
    children?: LayoutBuilderItem[];
};

export type PopoverContentItem = BaseLayoutItem & {
    type: "popover-content";
    children?: LayoutBuilderItem[];
};
