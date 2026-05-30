import type { BaseLayoutItem } from "../../types/base-layout";

export type LongTextItem = BaseLayoutItem & {
    type: "long-text";
    text: string;
};
