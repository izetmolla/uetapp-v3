import type { BaseLayoutItem, LayoutBuilderChildItem } from "../../types/base-layout";

export type ToggleGroupLayoutItem = BaseLayoutItem & {
    type: "toggle-group";
    children?: LayoutBuilderChildItem[];
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
