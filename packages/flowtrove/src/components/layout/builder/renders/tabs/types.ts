import type { BaseLayoutItem } from "../../types/base-layout";
import type { LayoutBuilderItem } from "../../types/items";

export type TabDef = {
    value: string;
    label: string;
    children?: LayoutBuilderItem[];
};

export type TabsItem = BaseLayoutItem & {
    type: "tabs";
    children?: LayoutBuilderItem[];
    tabs?: TabDef[];
    defaultValue?: string;
    orientation?: "horizontal" | "vertical";
    listVariant?: "default" | "line";
};

export type TabsListItem = BaseLayoutItem & {
    type: "tabs-list";
    children?: LayoutBuilderItem[];
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
    children?: LayoutBuilderItem[];
};
