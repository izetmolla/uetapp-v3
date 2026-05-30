"use client";

import { useCallback, useState } from "react";
import { useLayoutBuilderContext } from "../LayoutBuilderContext";
import { buildRequestConfig, normalizeSelectOptions } from "./network";
import type { FetchOptions, FetchSelectOption } from "../types/fetch-options";

export type RsOption = { value: string; label: string };

export type ItemWithOptionsApi = {
    options?: RsOption[];
    optionsApi?: FetchOptions | string;
};

export function useRsOptions(item: ItemWithOptionsApi): {
    options: FetchSelectOption[];
    loading: boolean;
    error: string | undefined;
    fetchData: () => Promise<void>;
} {
    const { axios } = useLayoutBuilderContext();
    const hasApi = Boolean(item.optionsApi);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [options, setOptions] = useState<FetchSelectOption[]>(
        hasApi ? [] : (item.options ?? []),
    );

    const fetchData = useCallback(async () => {
        if (!item.optionsApi || !axios) return;
        setLoading(true);
        setError(undefined);
        try {
            const config = buildRequestConfig(item.optionsApi);
            const res = await axios.request({
                method: config.method,
                url: config.url,
                params: config.params,
                data: config.data,
            });
            const data = normalizeSelectOptions(
                (res?.data as { data?: unknown })?.data ?? res?.data,
            );
            setOptions(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load options");
            setOptions([]);
        } finally {
            setLoading(false);
        }
    }, [item.optionsApi, axios]);

    if (!hasApi) {
        return {
            options: item.options ?? [],
            loading: false,
            error: undefined,
            fetchData: async () => {},
        };
    }

    return { options, loading, error, fetchData };
}
