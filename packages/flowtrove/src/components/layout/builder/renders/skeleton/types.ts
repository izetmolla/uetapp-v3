import type { BaseLayoutItem } from "../../types/base-layout";

export type SkeletonItem = BaseLayoutItem & {
    type: "skeleton";
    children?: unknown[];
};
