import type { BaseLayoutItem, LayoutBuilderChildItem } from "../../types/base-layout";

export type ScrollAreaItem = BaseLayoutItem & {
    type: "scroll-area";
    children?: LayoutBuilderChildItem[];
};
