import type { BaseFormFieldItem } from "../../types/items-types";
import type { FetchOptions, RsCommonProps } from "../../types/fetch-options";

export type RsOption = { value: string; label: string };

/** rs-creatable: select with create-new-option (options from API or static) */
export type RsCreatableItem = BaseFormFieldItem &
    RsCommonProps & {
        type: "rs-creatable";
        options?: RsOption[];
        optionsApi?: FetchOptions | string;
        /** When true (default), fetch on mount when `optionsApi` is set. */
        onLoadFetch?: boolean;
        placeholder?: string;
        defaultValue?: string | string[];
        /** API config for persisting a newly created option. */
        onCreateConfigAPI?: {
            url: string;
            method?: "POST" | "PUT" | "PATCH";
            body?: Record<string, unknown>;
            showLoader?: boolean;
            disableOnFetch?: boolean;
            successMessage?: string;
            errorMessage?: string;
        };
    };
