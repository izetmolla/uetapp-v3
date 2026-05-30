import type { BaseLayoutItem } from "../../types/base-layout";

export type ProgressItem = BaseLayoutItem & {
    type: "progress";
    value?: number;
};
