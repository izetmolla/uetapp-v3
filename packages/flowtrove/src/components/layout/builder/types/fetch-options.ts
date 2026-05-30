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
