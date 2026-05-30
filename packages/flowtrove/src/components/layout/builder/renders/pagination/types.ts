import type { BaseLayoutItem } from "../../types/base-layout";

export type PaginationItem = BaseLayoutItem & {
    type: "pagination";
    children?: unknown[];
};
