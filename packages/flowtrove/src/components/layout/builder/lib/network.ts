import type { FetchOptions, FetchSelectOption } from "../types/fetch-options";
import { isFetchOptions, normalizeFetchOptions } from "../types/fetch-options";

const BODY_METHODS = new Set(["POST", "PUT", "PATCH"]);

export function normalizeSelectOptions(data: unknown): FetchSelectOption[] {
    if (!Array.isArray(data)) return [];
    return data
        .map((row) => {
            if (row && typeof row === "object" && "value" in row && "label" in row) {
                return {
                    value: String((row as { value: unknown }).value),
                    label: String((row as { label: unknown }).label),
                };
            }
            if (row && typeof row === "object" && "id" in row && "name" in row) {
                return {
                    value: String((row as { id: unknown }).id),
                    label: String((row as { name: unknown }).name),
                };
            }
            if (row && typeof row === "object" && "id" in row) {
                const v = (row as { id: unknown }).id;
                return { value: String(v), label: String(v) };
            }
            return { value: "", label: "" };
        })
        .filter((o) => o.value !== "" || o.label !== "");
}

export function buildRequestConfig(optionsApi: FetchOptions | string): {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    url: string;
    params?: Record<string, unknown>;
    data?: unknown;
} {
    if (typeof optionsApi === "string") {
        return { method: "GET", url: optionsApi };
    }
    if (isFetchOptions(optionsApi)) {
        const normalized = normalizeFetchOptions(optionsApi);
        const params = normalized.params as Record<string, unknown> | undefined;
        const body = normalized.data;
        return {
            method: normalized.method,
            url: normalized.url,
            ...(params != null && !BODY_METHODS.has(normalized.method) ? { params } : {}),
            ...(params != null && BODY_METHODS.has(normalized.method) ? { data: params } : {}),
            ...(body != null && BODY_METHODS.has(normalized.method) ? { data: body } : {}),
        };
    }
    return { method: "GET", url: String(optionsApi) };
}

/** Load options from API for async select (e.g. rs-async). */
export async function loadOptionsAsync(
    optionsApi: FetchOptions | string,
    axiosInstance: import("axios").AxiosInstance | undefined,
    inputValue: string,
): Promise<FetchSelectOption[]> {
    if (!axiosInstance) return [];
    const config = buildRequestConfig(optionsApi);
    const useBody = BODY_METHODS.has(config.method);
    const res = await axiosInstance.request({
        method: config.method,
        url: config.url,
        ...(useBody
            ? { data: { ...((config.data as object) ?? {}), search: inputValue } }
            : { params: { ...(config.params ?? {}), search: inputValue } }),
    });
    const data = (res?.data as { data?: unknown })?.data ?? res?.data;
    return normalizeSelectOptions(data);
}
