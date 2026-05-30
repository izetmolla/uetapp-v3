import type { BaseLayoutItem, LayoutBuilderChildItem } from "../../types/base-layout";

export type PopoverItem = BaseLayoutItem & {
    type: "popover";
    children?: LayoutBuilderChildItem[];
    trigger?: LayoutBuilderChildItem[];
};

export type PopoverTriggerItem = BaseLayoutItem & {
    type: "popover-trigger";
    children?: LayoutBuilderChildItem[];
};

export type PopoverContentItem = BaseLayoutItem & {
    type: "popover-content";
    children?: LayoutBuilderChildItem[];
};
