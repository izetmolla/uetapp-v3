"use client";

import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { ReactSelectCreatable } from "@workspace/ui/components/reactselectcreatable";
import type { LayoutRendererProps } from "../../types";
import { ConnectedFormField } from "../../lib/connected-form-field";
import type { RsCreatableItem } from "./types";

function RsCreatableControl({
    item,
    value,
    onValueChange,
}: {
    item: RsCreatableItem;
    value: string | string[];
    onValueChange: (value: string | string[]) => void;
}) {
    return (
        <ReactSelectCreatable
            options={item.options as never}
            value={value as never}
            onValueChange={onValueChange as never}
            isMulti={item.multi}
            placeholder={item.placeholder ?? "Select or create…"}
            isDisabled={item.disabled}
            className={cn(item.className)}
        />
    );
}

function RsCreatableRenderer({ item }: LayoutRendererProps<RsCreatableItem>) {
    const [previewValue, setPreviewValue] = useState<string | string[]>(
        item.multi ? (Array.isArray(item.defaultValue) ? item.defaultValue : []) : (item.defaultValue ?? ""),
    );

    return (
        <ConnectedFormField
            item={item}
            renderPreview={() => (
                <RsCreatableControl item={item} value={previewValue} onValueChange={setPreviewValue} />
            )}
            renderControl={(field) => (
                <RsCreatableControl
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

export default RsCreatableRenderer;
export type { RsCreatableItem };
