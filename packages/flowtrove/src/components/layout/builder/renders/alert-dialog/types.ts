import type { BaseLayoutItem, LayoutBuilderChildItem } from "../../types/base-layout";

export type AlertDialogItem = BaseLayoutItem & {
    type: "alert-dialog";
    children?: LayoutBuilderChildItem[];
    trigger?: LayoutBuilderChildItem[];
    title?: string;
    description?: string;
    footer?: LayoutBuilderChildItem[];
    size?: "default" | "sm";
};

export type AlertDialogTriggerItem = BaseLayoutItem & {
    type: "alert-dialog-trigger";
    children?: LayoutBuilderChildItem[];
};

export type AlertDialogContentItem = BaseLayoutItem & {
    type: "alert-dialog-content";
    children?: LayoutBuilderChildItem[];
    size?: "default" | "sm";
};

export type AlertDialogHeaderItem = BaseLayoutItem & {
    type: "alert-dialog-header";
    children?: LayoutBuilderChildItem[];
};

export type AlertDialogTitleItem = BaseLayoutItem & { type: "alert-dialog-title"; text: string };
export type AlertDialogDescriptionItem = BaseLayoutItem & {
    type: "alert-dialog-description";
    text: string;
};

export type AlertDialogFooterItem = BaseLayoutItem & {
    type: "alert-dialog-footer";
    children?: LayoutBuilderChildItem[];
};
