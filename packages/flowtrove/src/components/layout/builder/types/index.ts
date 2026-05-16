import type { LayoutBuilderItem } from "./items";




export type {
    LayoutBuilderItem,
}


export type FetchSelectOption = { value: string; label: string };
export type FetchOptions = {
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    params?: Record<string, unknown>;
    data?: unknown;
    replaceOptions?: boolean;
};
/** Common props for rs (react-select) items */
export type RsCommonProps = {
    clearable?: boolean;
    searchable?: boolean;
    disabled?: boolean;
    loading?: boolean;
    rtl?: boolean;
    multi?: boolean;
};




/** Base props passed to all item renderers */
export type LayoutRendererProps<T extends LayoutBuilderItem = LayoutBuilderItem> = {
    /** The item configuration to render */
    item: T;
    /** Function to render child items (for containers) */
    renderItems: (items: LayoutBuilderItem[], pathPrefix?: number[]) => React.ReactNode;
    /** Current path in the item tree (for designer mode) */
    path?: number[];
    /** Data context for data binding */
    data?: Record<string, unknown>;
};
