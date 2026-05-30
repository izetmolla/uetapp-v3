"use client";

import { useCallback, useMemo, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { ReactSelectAsync } from "@workspace/ui/components/reactselectasync";
import type { LayoutRendererProps } from "../../types";
import { ConnectedFormField } from "../../lib/connected-form-field";
import { useLayoutBuilderContext } from "../../LayoutBuilderContext";
import { loadOptionsAsync } from "../../lib/network";
import type { RsAsyncItem } from "./types";

function resolveOptionsApi(item: RsAsyncItem): RsAsyncItem["optionsApi"] {
    if (item.optionsApi) return item.optionsApi;
    if (item.loadOptionsUrl) return item.loadOptionsUrl;
    return undefined;
}

function RsAsyncControl({
    item,
    value,
    onValueChange,
    onBlur,
    loadOptions,
}: {
    item: RsAsyncItem;
    value: string | string[];
    onValueChange: (value: string | string[]) => void;
    onBlur?: () => void;
    loadOptions: (inputValue: string) => Promise<{ value: string; label: string }[]>;
}) {
    const defaultOptions = useMemo(() => {
        if (item.defaultOptions === true) return true;
        if (Array.isArray(item.defaultOptions) && item.defaultOptions.length > 0) {
            return item.defaultOptions;
        }
        return item.options?.length ? item.options : true;
    }, [item.defaultOptions, item.options]);

    return (
        <ReactSelectAsync
            loadOptions={loadOptions as never}
            defaultOptions={defaultOptions as never}
            value={value as never}
            onValueChange={onValueChange as never}
            onBlur={onBlur}
            isMulti={item.multi === true}
            placeholder={item.placeholder ?? "Type to search…"}
            isDisabled={item.disabled}
            isClearable={item.clearable !== false}
            isSearchable={item.searchable !== false}
            isLoading={item.loading === true}
            isRtl={item.rtl === true}
            className={cn("react-select-container", item.className)}
        />
    );
}

function RsAsyncRenderer({ item }: LayoutRendererProps<RsAsyncItem>) {
    const { axios } = useLayoutBuilderContext();
    const optionsApi = resolveOptionsApi(item);
    const [previewValue, setPreviewValue] = useState<string | string[]>(
        item.multi
            ? (Array.isArray(item.defaultValue) ? item.defaultValue : [])
            : (item.defaultValue ?? ""),
    );

    const loadOptions = useCallback(
        (inputValue: string) => {
            if (!optionsApi) return Promise.resolve(item.options ?? []);
            return loadOptionsAsync(optionsApi, axios, inputValue);
        },
        [optionsApi, axios, item.options],
    );

    return (
        <ConnectedFormField
            item={item}
            renderPreview={() => (
                <RsAsyncControl
                    item={item}
                    value={previewValue}
                    onValueChange={setPreviewValue}
                    loadOptions={loadOptions}
                />
            )}
            renderControl={(field) => (
                <RsAsyncControl
                    item={item}
                    value={
                        (field.value as string | string[] | undefined) ??
                        (item.multi ? [] : "")
                    }
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    loadOptions={loadOptions}
                />
            )}
        />
    );
}

export default RsAsyncRenderer;
export type { RsAsyncItem, RsOption } from "./types";
