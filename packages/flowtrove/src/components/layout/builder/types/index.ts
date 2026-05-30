import type { LayoutBuilderItem } from "./items";
import type { LayoutBuilderChildItem } from "./base-layout";

export type {
    LayoutBuilderItem,
    BaseLayoutItem,
    ContainerItem,
    LayoutBuilderChildItem,
} from "./items";

export type { FetchSelectOption, FetchOptions, RsCommonProps } from "./fetch-options";
export { isFetchOptions, normalizeFetchOptions } from "./fetch-options";

/** Base props passed to all item renderers */
export type LayoutRendererProps<T extends LayoutBuilderItem = LayoutBuilderItem> = {
    /** The item configuration to render */
    item: T;
    /** Function to render child items (for containers) */
    renderItems: (items: LayoutBuilderChildItem[], pathPrefix?: number[]) => React.ReactNode;
    /** Current path in the item tree (for designer mode) */
    path?: number[];
    /** Data context for data binding */
    data?: Record<string, unknown>;
};
