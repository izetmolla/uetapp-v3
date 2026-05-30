import type { BaseLayoutItem } from "../../types/base-layout";

export type SeparatorItem = BaseLayoutItem & {
    type: "separator";
    orientation?: "horizontal" | "vertical";
};
