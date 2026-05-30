import type { BaseLayoutItem } from "../../types/base-layout";
import type { LayoutBuilderItem } from "../../types/items";

export type ButtonGroupItem = BaseLayoutItem & {
    type: "button-group";
    children?: LayoutBuilderItem[];
};
