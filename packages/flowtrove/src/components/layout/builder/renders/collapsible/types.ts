import type { BaseLayoutItem, LayoutBuilderChildItem } from "../../types/base-layout";

export type CollapsibleItem = BaseLayoutItem & {
    type: "collapsible";
    children?: LayoutBuilderChildItem[];
    open?: boolean;
    triggerLabel?: string;
};

export type CollapsibleTriggerItem = BaseLayoutItem & {
    type: "collapsible-trigger";
    children?: LayoutBuilderChildItem[];
};

export type CollapsibleContentItem = BaseLayoutItem & {
    type: "collapsible-content";
    children?: LayoutBuilderChildItem[];
};
