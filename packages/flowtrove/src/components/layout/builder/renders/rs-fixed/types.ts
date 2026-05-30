import type { BaseFormFieldItem } from "../../types/items-types";
import type { FetchOptions, RsCommonProps } from "../../types/fetch-options";

export type RsOption = { value: string; label: string };

/** rs-fixed: select with fixed or API-fetched options */
export type RsFixedItem = BaseFormFieldItem &
    RsCommonProps & {
        type: "rs-fixed";
        options?: RsOption[];
        optionsApi?: FetchOptions | string;
        /** When true, fetch on mount; when false/ omitted, fetch on first menu open. */
        onLoadFetch?: boolean;
        placeholder?: string;
        defaultValue?: string | string[];
    };
