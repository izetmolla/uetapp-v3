"use client";

import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { ReactSelectAsync } from "@workspace/ui/components/reactselectasync";
import type { LayoutRendererProps } from "../../types";
import { ConnectedFormField } from "../../lib/connected-form-field";
import { useLayoutBuilderContext } from "../../LayoutBuilderContext";
import type { RsAsyncItem } from "./types";

function RsAsyncControl({
    item,
    value,
    onValueChange,
    loadOptions,
}: {
    item: RsAsyncItem;
    value: string | string[];
    onValueChange: (value: string | string[]) => void;
    loadOptions: (inputValue: string) => Promise<unknown[]>;
}) {
    return (
        <ReactSelectAsync
            loadOptions={loadOptions as never}
            defaultOptions={(item.options ?? true) as never}
            value={value as never}
            onValueChange={onValueChange as never}
            isMulti={item.multi}
            placeholder={item.placeholder ?? "Search…"}
            isDisabled={item.disabled}
            className={cn(item.className)}
        />
    );
}

function RsAsyncRenderer({ item }: LayoutRendererProps<RsAsyncItem>) {
    const { axios } = useLayoutBuilderContext();
    const [previewValue, setPreviewValue] = useState<string | string[]>(
        item.multi ? [] : (item.defaultValue ?? ""),
    );

    const loadOptions = async (inputValue: string) => {
        if (!axios || !item.loadOptionsUrl) {
            return (item.options ?? []) as never[];
        }
        const res = await axios.get(item.loadOptionsUrl, { params: { q: inputValue } });
        const data = (res.data as { data?: unknown })?.data ?? res.data;
        return (Array.isArray(data) ? data : []) as never[];
    };

    return (
        <ConnectedFormField
            item={item}
            renderPreview={() => (
                <RsAsyncControl
                    item={item}
                    value={previewValue}
                    onValueChange={setPreviewValue}
                    loadOptions={loadOptions as never}
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
                    loadOptions={loadOptions as never}
                />
            )}
        />
    );
}

export default RsAsyncRenderer;
export type { RsAsyncItem };
