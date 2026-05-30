"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";
import { ReactSelectCreatable } from "@workspace/ui/components/reactselectcreatable";
import type { LayoutRendererProps } from "../../types";
import { ConnectedFormField } from "../../lib/connected-form-field";
import { useLayoutBuilderContext } from "../../LayoutBuilderContext";
import { useRsOptions } from "../../lib/use-rs-options";
import type { RsCreatableItem } from "./types";

function RsCreatableControl({
    item,
    value,
    onValueChange,
    onBlur,
    onCreateOption,
    creating,
    disabled,
}: {
    item: RsCreatableItem;
    value: string | string[];
    onValueChange: (value: string | string[]) => void;
    onBlur?: () => void;
    onCreateOption: (inputValue: string) => void | Promise<void>;
    creating: boolean;
    disabled?: boolean;
}) {
    const { options, loading } = useRsOptions(item);
    const optionsList = options.length > 0 ? options : item.options ?? [];
    const isMulti = item.multi === true;
    const isDisabled = disabled ?? item.disabled ?? creating;

    return (
        <ReactSelectCreatable
            options={optionsList as never}
            value={value as never}
            onValueChange={onValueChange as never}
            onBlur={onBlur}
            onCreateOption={(inputValue) => {
                void onCreateOption(inputValue);
            }}
            isMulti={isMulti}
            placeholder={item.placeholder ?? "Choose or create…"}
            isDisabled={isDisabled}
            isClearable={item.clearable !== false}
            isSearchable={item.searchable !== false}
            isLoading={loading || creating || item.loading === true}
            isRtl={item.rtl === true}
            className={cn("react-select-container", item.className)}
        />
    );
}

function RsCreatableRenderer({ item }: LayoutRendererProps<RsCreatableItem>) {
    const { axios } = useLayoutBuilderContext();
    const { fetchData } = useRsOptions(item);
    const [creating, setCreating] = useState(false);
    const [previewValue, setPreviewValue] = useState<string | string[]>(
        item.multi
            ? (Array.isArray(item.defaultValue) ? item.defaultValue : [])
            : (item.defaultValue ?? ""),
    );

    useEffect(() => {
        if (item.optionsApi && item.onLoadFetch !== false) {
            void fetchData();
        }
    }, [item.optionsApi, item.onLoadFetch, fetchData]);

    const appendValue = useCallback(
        (current: string | string[] | undefined, inputValue: string): string | string[] => {
            if (item.multi) {
                const prev = Array.isArray(current) ? current : [];
                return prev.includes(inputValue) ? prev : [...prev, inputValue];
            }
            return inputValue;
        },
        [item.multi],
    );

    const handleCreateOption = useCallback(
        async (
            inputValue: string,
            apply: (next: string | string[]) => void,
            current: string | string[] | undefined,
        ) => {
            const cfg = item.onCreateConfigAPI;
            if (!cfg?.url || !axios) {
                apply(appendValue(current, inputValue));
                return;
            }

            setCreating(true);
            try {
                const method = (cfg.method ?? "POST").toUpperCase();
                await axios.request({
                    url: cfg.url,
                    method: method as "POST" | "PUT" | "PATCH",
                    data: {
                        ...(cfg.body ?? {}),
                        label: inputValue,
                        value: inputValue,
                    },
                });
                apply(appendValue(current, inputValue));
                if (item.optionsApi) {
                    await fetchData();
                }
                if (cfg.successMessage) {
                    toast.success(cfg.successMessage);
                }
            } catch {
                if (cfg.errorMessage) {
                    toast.error(cfg.errorMessage);
                }
            } finally {
                setCreating(false);
            }
        },
        [appendValue, axios, fetchData, item.onCreateConfigAPI, item.optionsApi],
    );

    return (
        <ConnectedFormField
            item={item}
            renderPreview={() => (
                <RsCreatableControl
                    item={item}
                    value={previewValue}
                    onValueChange={setPreviewValue}
                    creating={creating}
                    onCreateOption={(inputValue) =>
                        handleCreateOption(inputValue, setPreviewValue, previewValue)
                    }
                />
            )}
            renderControl={(field) => (
                <RsCreatableControl
                    item={item}
                    value={
                        (field.value as string | string[] | undefined) ??
                        (item.multi ? [] : "")
                    }
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    creating={creating}
                    disabled={item.onCreateConfigAPI?.disableOnFetch && creating}
                    onCreateOption={(inputValue) =>
                        handleCreateOption(inputValue, field.onChange, field.value as string | string[] | undefined)
                    }
                />
            )}
        />
    );
}

export default RsCreatableRenderer;
export type { RsCreatableItem, RsOption } from "./types";
