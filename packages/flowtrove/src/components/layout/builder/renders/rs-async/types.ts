import type { BaseFormFieldItem } from "../../types/items-types";
import type { FetchOptions, RsCommonProps } from "../../types/fetch-options";

export type RsOption = { value: string; label: string };

/** rs-async: async search select (options loaded by API on input) */
export type RsAsyncItem = BaseFormFieldItem &
    RsCommonProps & {
        type: "rs-async";
        /** Options API config (required for async remote search). */
        optionsApi?: FetchOptions | string;
        /** @deprecated Use `optionsApi`. Simple GET URL with `?search=` query param. */
        loadOptionsUrl?: string;
        /** Static options for label lookup / defaultOptions seed. */
        options?: RsOption[];
        /** Default options: true = load on open, or initial option list. */
        defaultOptions?: RsOption[] | true;
        placeholder?: string;
        defaultValue?: string | string[];
    };
