import type { CSSProperties } from "react";
import type { LayoutBuilderItem } from "./items";

/** Base properties shared by all layout items */
export type BaseLayoutItem = {
    type: string;
    id: string;
    className?: string;
    style?: CSSProperties;
    condition?: string;
    locked?: boolean;
};

/** Container base with typed children (type-only import avoids runtime cycle) */
export type ContainerItem = BaseLayoutItem & {
    children?: LayoutBuilderItem[];
};
