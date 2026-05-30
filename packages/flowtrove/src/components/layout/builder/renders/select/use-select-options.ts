"use client";

import { useQuery } from "@tanstack/react-query";
import { useLayoutBuilderContext } from "../../LayoutBuilderContext";
import type { FetchSelectOption } from "../../types";
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

export function useSelectOptions(item: Pick<SelectItem, "options" | "fetchOptions" | "replaceOptions">) {
    const { axios } = useLayoutBuilderContext();
    const staticOptions = item.options ?? [];
    const fetchOptions = item.fetchOptions;

    const { data: fetched = [], isLoading } = useQuery({
        queryKey: [
            "layout-select-options",
            fetchOptions?.url,
            fetchOptions?.method,
            fetchOptions?.params,
            fetchOptions?.data,
        ],
        enabled: Boolean(fetchOptions?.url && axios),
        queryFn: async () => {
            if (!axios || !fetchOptions?.url) {
                return [] as SelectOption[];
            }
            const response = await axios.request<unknown>({
                url: fetchOptions.url,
                method: fetchOptions.method,
                params: fetchOptions.params,
                data: fetchOptions.data,
            });
            const payload = (response.data as { data?: unknown })?.data ?? response.data;
            return normalizeOptions(payload);
        },
    });

    if (!fetchOptions) {
        return { options: staticOptions, isLoading: false };
    }

    const replace = item.replaceOptions ?? fetchOptions.replaceOptions ?? false;
    if (replace) {
        return { options: fetched, isLoading };
    }

    return { options: [...staticOptions, ...fetched], isLoading };
}
