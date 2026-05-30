"use client";

import { useQuery } from "@tanstack/react-query";
import { useLayoutBuilderContext } from "../../LayoutBuilderContext";
import type { FetchSelectOption } from "../../types";
import {
    getStaticSelectOptions,
    resolveSelectFetchConfig,
} from "../../lib/select-options-source";
import type { SelectItem, SelectOption } from "./types";

function normalizeOptions(data: unknown): SelectOption[] {
    if (!Array.isArray(data)) {
        return [];
    }
    return data
        .map((entry) => {
            if (entry == null || typeof entry !== "object") {
                return null;
            }
            const row = entry as FetchSelectOption;
            if (typeof row.value !== "string" || typeof row.label !== "string") {
                return null;
            }
            return { value: row.value, label: row.label };
        })
        .filter((opt): opt is SelectOption => opt != null);
}

export function useSelectOptions(
    item: Pick<SelectItem, "options" | "fetchOptions" | "replaceOptions">,
) {
    const { axios } = useLayoutBuilderContext();
    const staticOptions = getStaticSelectOptions(item.options);
    const fetchConfig = resolveSelectFetchConfig(item);

    const { data: fetched = [], isLoading } = useQuery({
        queryKey: [
            "layout-select-options",
            fetchConfig?.url,
            fetchConfig?.method,
            fetchConfig?.params,
            fetchConfig?.data,
        ],
        enabled: Boolean(fetchConfig?.url && axios),
        queryFn: async () => {
            if (!axios || !fetchConfig?.url) {
                return [] as SelectOption[];
            }
            const response = await axios.request<unknown>({
                url: fetchConfig.url,
                method: fetchConfig.method,
                params: fetchConfig.params,
                data: fetchConfig.data,
            });
            const payload = (response.data as { data?: unknown })?.data ?? response.data;
            return normalizeOptions(payload);
        },
    });

    if (!fetchConfig) {
        return { options: staticOptions, isLoading: false };
    }

    const replace = item.replaceOptions ?? fetchConfig.replaceOptions ?? false;
    if (replace) {
        return { options: fetched, isLoading };
    }

    return { options: [...staticOptions, ...fetched], isLoading };
}
