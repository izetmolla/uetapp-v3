import type { BaseLayoutItem } from "../../types/base-layout";

export type LabelItem = BaseLayoutItem & {
    type: "label";
    text: string;
};
