import type { BaseLayoutItem } from "../../types/base-layout";
import type { LayoutBuilderItem } from "../../types/items";

export type TooltipItem = BaseLayoutItem & {
    type: "tooltip";
    children?: LayoutBuilderItem[];
    content?: string;
};

export type TooltipTriggerItem = BaseLayoutItem & {
    type: "tooltip-trigger";
    children?: LayoutBuilderItem[];
};

export type TooltipContentItem = BaseLayoutItem & {
    type: "tooltip-content";
    text: string;
};
