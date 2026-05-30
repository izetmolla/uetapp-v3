import type { BaseLayoutItem, LayoutBuilderChildItem } from "../../types/base-layout";

export type ButtonGroupItem = BaseLayoutItem & {
    type: "button-group";
    children?: LayoutBuilderChildItem[];
};
