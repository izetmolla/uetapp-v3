import type { BaseLayoutItem, LayoutBuilderItem } from "../../types/items";

/**
 * Card – maps to shadcn Card
 *
 * **Composed layout:** set `children` to slot items in order, e.g. `card-header` (with nested
 * `card-title`, `card-description`, `card-action`), then `card-content`, then optional `card-footer`.
 *
 * **Legacy layout:** use `title` / `description` / `headerAction` / `footer` / `children` (main body)
 * without top-level `card-header` | `card-content` | `card-footer` items in `children`.
 */
export type CardItem = BaseLayoutItem & {
    type: "card";
    size?: "default" | "sm";
    /** Main body in legacy mode, or composed slot items (see type doc). */
    children?: LayoutBuilderItem[];
    title?: string;
    description?: string;
    footer?: LayoutBuilderItem[];
    headerAction?: LayoutBuilderItem[];
    contentClassName?: string;
    headerClassName?: string;
    footerClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    headerActionClassName?: string;
};


export type CardActionItem = BaseLayoutItem & {
    type: "card-action";
    children?: LayoutBuilderItem[];
};

export type CardContentItem = BaseLayoutItem & {
    type: "card-content";
    /** Extra top padding when this block is the main body and there is no `card-header` sibling (optional). */
    paddingTopWhenNoHeader?: boolean;
    children?: LayoutBuilderItem[];
};

export type CardDescriptionItem = BaseLayoutItem & {
    type: "card-description";
    text: string;
};

export type CardTitleItem = BaseLayoutItem & {
    type: "card-title";
    text: string;
};
export type CardFooterItem = BaseLayoutItem & {
    type: "card-footer";
    children?: LayoutBuilderItem[];
};
export type CardHeaderItem = BaseLayoutItem & {
    type: "card-header";
    children?: LayoutBuilderItem[];
};