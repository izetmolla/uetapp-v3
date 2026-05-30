import type { BaseLayoutItem } from "../../types/base-layout";

export type BreadcrumbItem = BaseLayoutItem & {
    type: "breadcrumb";
    children?: unknown[];
};
