import type { BaseLayoutItem, LayoutBuilderChildItem } from "../../types/base-layout";

export type TooltipItem = BaseLayoutItem & {
    type: "tooltip";
    children?: LayoutBuilderChildItem[];
    content?: string;
};

export type TooltipTriggerItem = BaseLayoutItem & {
    type: "tooltip-trigger";
    children?: LayoutBuilderChildItem[];
};

export type TooltipContentItem = BaseLayoutItem & {
    type: "tooltip-content";
    text: string;
};
