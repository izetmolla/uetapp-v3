import type { BaseLayoutItem, LayoutBuilderChildItem } from "../../types/base-layout";

export type TabDef = {
    value: string;
    label: string;
    children?: LayoutBuilderChildItem[];
};

export type TabsItem = BaseLayoutItem & {
    type: "tabs";
    children?: LayoutBuilderChildItem[];
    tabs?: TabDef[];
    defaultValue?: string;
    orientation?: "horizontal" | "vertical";
    listVariant?: "default" | "line";
};

export type TabsListItem = BaseLayoutItem & {
    type: "tabs-list";
    children?: LayoutBuilderChildItem[];
    variant?: "default" | "line";
};

export type TabsTriggerItem = BaseLayoutItem & {
    type: "tabs-trigger";
    value: string;
    text: string;
};

export type TabsContentItem = BaseLayoutItem & {
    type: "tabs-content";
    value: string;
    children?: LayoutBuilderChildItem[];
};
