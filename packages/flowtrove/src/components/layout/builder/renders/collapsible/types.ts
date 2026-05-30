import type { BaseLayoutItem } from "../../types/base-layout";
import type { LayoutBuilderItem } from "../../types/items";

export type CollapsibleItem = BaseLayoutItem & {
    type: "collapsible";
    children?: LayoutBuilderItem[];
    open?: boolean;
    triggerLabel?: string;
};

export type CollapsibleTriggerItem = BaseLayoutItem & {
    type: "collapsible-trigger";
    children?: LayoutBuilderItem[];
};

export type CollapsibleContentItem = BaseLayoutItem & {
    type: "collapsible-content";
    children?: LayoutBuilderItem[];
};
