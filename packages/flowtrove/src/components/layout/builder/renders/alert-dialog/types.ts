import type { BaseLayoutItem } from "../../types/base-layout";
import type { LayoutBuilderItem } from "../../types/items";

export type AlertDialogItem = BaseLayoutItem & {
    type: "alert-dialog";
    children?: LayoutBuilderItem[];
    trigger?: LayoutBuilderItem[];
    title?: string;
    description?: string;
    footer?: LayoutBuilderItem[];
    size?: "default" | "sm";
};

export type AlertDialogTriggerItem = BaseLayoutItem & {
    type: "alert-dialog-trigger";
    children?: LayoutBuilderItem[];
};

export type AlertDialogContentItem = BaseLayoutItem & {
    type: "alert-dialog-content";
    children?: LayoutBuilderItem[];
    size?: "default" | "sm";
};

export type AlertDialogHeaderItem = BaseLayoutItem & {
    type: "alert-dialog-header";
    children?: LayoutBuilderItem[];
};

export type AlertDialogTitleItem = BaseLayoutItem & { type: "alert-dialog-title"; text: string };
export type AlertDialogDescriptionItem = BaseLayoutItem & {
    type: "alert-dialog-description";
    text: string;
};

export type AlertDialogFooterItem = BaseLayoutItem & {
    type: "alert-dialog-footer";
    children?: LayoutBuilderItem[];
};
