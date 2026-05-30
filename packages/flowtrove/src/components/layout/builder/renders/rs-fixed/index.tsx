"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { ReactSelect } from "@workspace/ui/components/reactselect";
import type { LayoutRendererProps } from "../../types";
import { ConnectedFormField } from "../../lib/connected-form-field";
import { useRsOptions } from "../../lib/use-rs-options";
import type { RsFixedItem } from "./types";

function RsFixedControl({
    item,
    value,
    onValueChange,
    onBlur,
    disabled,
}: {
    item: RsFixedItem;
    value: string | string[];
    onValueChange: (value: string | string[]) => void;
    onBlur?: () => void;
    disabled?: boolean;
}) {
    const { options, loading, fetchData } = useRsOptions(item);
    const hasFetchedOnOpenRef = useRef(false);
    const isMulti = item.multi === true;
    const optionsList = options.length > 0 ? options : item.options ?? [];
    const isDisabled = disabled ?? item.disabled ?? loading;

    useEffect(() => {
        if (item.optionsApi && item.onLoadFetch === true) {
            void fetchData();
        }
    }, [item.optionsApi, item.onLoadFetch, fetchData]);

    return (
        <ReactSelect
            options={optionsList as never}
            value={value as never}
            onValueChange={onValueChange as never}
            onBlur={onBlur}
            isMulti={isMulti}
            placeholder={item.placeholder ?? "Select…"}
            isDisabled={isDisabled}
            isClearable={item.clearable !== false}
            isSearchable={item.searchable !== false}
            isLoading={loading || item.loading === true}
            isRtl={item.rtl === true}
            className={cn("react-select-container", item.className)}
            onMenuOpen={() => {
                if (
                    item.optionsApi &&
                    item.onLoadFetch !== true &&
                    !hasFetchedOnOpenRef.current
                ) {
                    hasFetchedOnOpenRef.current = true;
                    void fetchData();
                }
            }}
        />
    );
}

function RsFixedRenderer({ item }: LayoutRendererProps<RsFixedItem>) {
    const [previewValue, setPreviewValue] = useState<string | string[]>(
        item.multi
            ? (Array.isArray(item.defaultValue) ? item.defaultValue : [])
            : (item.defaultValue ?? ""),
    );

    return (
        <ConnectedFormField
            item={item}
            renderPreview={() => (
                <RsFixedControl item={item} value={previewValue} onValueChange={setPreviewValue} />
            )}
            renderControl={(field) => (
                <RsFixedControl
                    item={item}
                    value={
                        (field.value as string | string[] | undefined) ??
                        (item.multi ? [] : "")
                    }
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                />
            )}
        />
    );
}

export default RsFixedRenderer;
export type { RsFixedItem, RsOption } from "./types";
