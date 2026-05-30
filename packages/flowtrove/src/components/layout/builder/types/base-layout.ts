import type { CSSProperties } from "react";

/** Base properties shared by all layout items */
export type BaseLayoutItem = {
    type: string;
    id: string;
    className?: string;
    style?: CSSProperties;
    condition?: string;
    locked?: boolean;
};

/**
 * Forward reference for nested items in type definitions.
 * Avoids import cycles with the `LayoutBuilderItem` union in `items.ts`.
 */
export type LayoutBuilderChildItem = BaseLayoutItem & Record<string, unknown>;

/** Container base with typed children */
export type ContainerItem = BaseLayoutItem & {
    children?: LayoutBuilderChildItem[];
};
