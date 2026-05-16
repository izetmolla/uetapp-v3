import type { BaseLayoutItem, LayoutBuilderItem } from "../../types/items";

/**
 * Dialog – maps to shadcn Dialog (Radix)
 *
 * **Composed layout:** `children` contains top-level **`dialog-trigger`** and/or **`dialog-content`**
 * (at least one of these slot types). Typical order: `dialog-trigger`, then
 * `dialog-content` (whose own `children` may include `dialog-header`, body items, `dialog-footer`).
 *
 * **Legacy layout:** flat **`trigger`**, **`title`**, **`description`**, **`children`** (body), **`footer`**
 * when `children` does not use those top-level slot types.
 */
export type DialogItem = BaseLayoutItem & {
    type: "dialog";
    /** Legacy: items that open the dialog. Composed: use `dialog-trigger` in `children`. */
    trigger?: LayoutBuilderItem[];
    /** Legacy: main body. Composed: slot items (`dialog-trigger`, `dialog-content`, …). */
    children?: LayoutBuilderItem[];
    title?: string;
    description?: string;
    footer?: LayoutBuilderItem[];
    showCloseButton?: boolean;
    triggerClassName?: string;
    contentClassName?: string;
    headerClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    footerClassName?: string;
};

export type DialogTriggerItem = BaseLayoutItem & {
    type: "dialog-trigger";
    children?: LayoutBuilderItem[];
};

export type DialogContentItem = BaseLayoutItem & {
    type: "dialog-content";
    children?: LayoutBuilderItem[];
    showCloseButton?: boolean;
};

export type DialogHeaderItem = BaseLayoutItem & {
    type: "dialog-header";
    children?: LayoutBuilderItem[];
};

export type DialogTitleItem = BaseLayoutItem & {
    type: "dialog-title";
    text: string;
};

export type DialogDescriptionItem = BaseLayoutItem & {
    type: "dialog-description";
    text: string;
};

export type DialogFooterItem = BaseLayoutItem & {
    type: "dialog-footer";
    children?: LayoutBuilderItem[];
    showCloseButton?: boolean;
};
