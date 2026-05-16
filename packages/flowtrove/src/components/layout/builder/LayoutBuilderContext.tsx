import { createContext, useContext } from "react";
import type { LayoutInterpolationConfig } from "./types/layout-interpolation";
import type  { LayoutBuilderItem } from "./types/items";
import type { AxiosInstance } from "axios";
import type { QueryClient } from "@tanstack/react-query";




/** Context value for layout builder */
export type LayoutBuilderContextValue = {
    items: LayoutBuilderItem[];
    axios?: AxiosInstance;
    /** Resolved TanStack Query client (prop, parent provider, or internal fallback). */
    queryClient?: QueryClient;
    data?: Record<string, unknown>;
    /** Default `{{ }}` behavior for `content` / `item-list` (overridable per block). */
    interpolation?: LayoutInterpolationConfig;



    /**
     * Designer mode: inline edit callback. When provided, text/heading (and similar)
     * renderers can update item content directly (e.g. contenteditable) and call
     * this with (path, patch) to persist changes.
     */
    onInlineEdit?: (path: number[], patch: Partial<LayoutBuilderItem>) => void;
    /** When set to an item id, that item may show inline editing on the canvas. */
    inlineEditActiveItemId?: string;
    /** Handler for component actions (button clicks, menu selections, etc.) */
    // onAction?: (detail: LayoutItemActionBinding) => void;
}



const LayoutBuilderContext = createContext<LayoutBuilderContextValue | null>(null);


function useLayoutBuilderContext(): LayoutBuilderContextValue {
    const ctx = useContext(LayoutBuilderContext);
    return ctx ?? {
        items: [],
        axios: undefined,
        queryClient: undefined,
        interpolation: undefined,
        //   data: undefined,
        // onAction: undefined,
        //   slots: undefined,
        //   customComponents: undefined,
        //   renderItemWrapper: undefined,
        //   renderListWrapper: undefined,
        //   onRequestAddChild: undefined,
        //   onActiveChange: undefined,
        //   previewViewport: undefined,
        onInlineEdit: undefined,
        inlineEditActiveItemId: undefined,
        //   form: undefined,
        //   axiosInstance: undefined,
        //   formContent: undefined,
        //   renderSubmitButton: undefined,
        //   getDataTableServerOptions: undefined,
    };
}


export { LayoutBuilderContext, useLayoutBuilderContext };