import type { BaseLayoutItem } from "../../types/base-layout";
import type { LayoutBuilderItem } from "../../types/items";

export type ScrollAreaItem = BaseLayoutItem & {
    type: "scroll-area";
    children?: LayoutBuilderItem[];
};
