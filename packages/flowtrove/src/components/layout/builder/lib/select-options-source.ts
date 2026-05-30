import type { FetchOptions } from "../types/fetch-options";
import { isFetchOptions, normalizeFetchOptions } from "../types/fetch-options";
import type { SelectOption } from "../renders/select/types";

/** Static list or HTTP descriptor on `select.options`. */
export type SelectOptionsSource = SelectOption[] | FetchOptions;

export function getStaticSelectOptions(
    options: SelectOptionsSource | undefined,
): SelectOption[] {
    if (!options || isFetchOptions(options)) {
        return [];
    }
    return options;
}

export function hasRemoteSelectOptions(item: {
    options?: SelectOptionsSource;
    fetchOptions?: FetchOptions;
}): boolean {
    return Boolean(item.fetchOptions?.url || isFetchOptions(item.options));
}

/** Resolve HTTP config from `fetchOptions` or object-form `options`. */
export function resolveSelectFetchConfig(item: {
    options?: SelectOptionsSource;
    fetchOptions?: FetchOptions;
}): ReturnType<typeof normalizeFetchOptions> | undefined {
    if (item.fetchOptions?.url) {
        return normalizeFetchOptions(item.fetchOptions);
    }
    if (isFetchOptions(item.options)) {
        return normalizeFetchOptions(item.options);
    }
    return undefined;
}
