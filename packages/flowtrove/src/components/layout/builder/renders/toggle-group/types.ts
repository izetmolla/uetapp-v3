import type { BaseLayoutItem } from "../../types/base-layout";
import type { LayoutBuilderItem } from "../../types/items";

export type ToggleGroupLayoutItem = BaseLayoutItem & {
    type: "toggle-group";
    children?: LayoutBuilderItem[];
    groupType?: "single" | "multiple";
    defaultValue?: string | string[];
    variant?: "default" | "outline";
    size?: "default" | "sm" | "lg";
};

export type ToggleGroupMemberItem = BaseLayoutItem & {
    type: "toggle-group-item";
    value: string;
    text: string;
};
