import type { BaseLayoutItem } from "../../types/base-layout";

export type TimelineItem = BaseLayoutItem & {
    type: "timeline";
    children?: unknown[];
};
