export type FetchSelectOption = { value: string; label: string };

export type FetchOptions = {
    url: string;
    /** HTTP verb (any case; normalized to uppercase at request time). Defaults to GET. */
    method?: string;
    params?: Record<string, unknown>;
    data?: unknown;
    replaceOptions?: boolean;
};

/** Returns true when `options` is an HTTP descriptor rather than a static option list. */
export function isFetchOptions(value: unknown): value is FetchOptions {
    return (
        value != null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        typeof (value as FetchOptions).url === "string" &&
        (value as FetchOptions).url.length > 0
    );
}

export function normalizeFetchOptions(config: FetchOptions): FetchOptions & {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
} {
    const raw = (config.method ?? "GET").trim().toUpperCase();
    const method = (
        raw === "GET" ||
        raw === "POST" ||
        raw === "PUT" ||
        raw === "DELETE" ||
        raw === "PATCH"
            ? raw
            : "GET"
    ) as "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    return { ...config, method };
}

/** Common props for rs (react-select) items */
export type RsCommonProps = {
    clearable?: boolean;
    searchable?: boolean;
    disabled?: boolean;
    loading?: boolean;
    rtl?: boolean;
    multi?: boolean;
};
