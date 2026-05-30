"use client";

import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { ReactSelect } from "@workspace/ui/components/reactselect";
import type { LayoutRendererProps } from "../../types";
import { ConnectedFormField } from "../../lib/connected-form-field";
import type { RsFixedItem } from "./types";

function RsSelectControl({
    item,
    value,
    onValueChange,
}: {
    item: RsFixedItem;
    value: string | string[];
    onValueChange: (value: string | string[]) => void;
}) {
    return (
        <ReactSelect
            options={item.options as never}
            value={value as never}
            onValueChange={onValueChange as never}
            isMulti={item.multi}
            placeholder={item.placeholder ?? "Select…"}
            isDisabled={item.disabled}
            className={cn(item.className)}
        />
    );
}

function RsFixedRenderer({ item }: LayoutRendererProps<RsFixedItem>) {
    const [previewValue, setPreviewValue] = useState<string | string[]>(
        item.multi ? (Array.isArray(item.defaultValue) ? item.defaultValue : []) : (item.defaultValue ?? ""),
    );

    return (
        <ConnectedFormField
            item={item}
            renderPreview={() => (
                <RsSelectControl item={item} value={previewValue} onValueChange={setPreviewValue} />
            )}
            renderControl={(field) => (
                <RsSelectControl
                    item={item}
                    value={
                        (field.value as string | string[] | undefined) ??
                        (item.multi ? [] : "")
                    }
                    onValueChange={field.onChange}
                />
            )}
        />
    );
}

export default RsFixedRenderer;
export type { RsFixedItem };
