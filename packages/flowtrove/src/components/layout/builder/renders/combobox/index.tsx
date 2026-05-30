"use client";

import { useMemo, useState } from "react";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@workspace/ui/components/combobox";
import { cn } from "@workspace/ui/lib/utils";
import type { LayoutRendererProps } from "../../types";
import { ConnectedFormField } from "../../lib/connected-form-field";
import type { ComboboxItem as ComboboxLayoutItem } from "./types";

function ComboboxControl({
    item,
    value,
    onValueChange,
}: {
    item: ComboboxLayoutItem;
    value: string | string[] | undefined;
    onValueChange: (value: string | string[]) => void;
}) {
    const items = item.items ?? [];
    const placeholder = item.placeholder ?? "Select…";
    const emptyText = item.emptyText ?? "No items found.";

    return (
        <div className={cn("w-full max-w-md", item.className)} style={item.style}>
            <Combobox
                items={items}
                value={value}
                onValueChange={(next) =>
                    onValueChange(next ?? (item.multiple ? [] : ""))
                }
                multiple={item.multiple}
                autoHighlight={item.autoHighlight}
            >
                <ComboboxInput
                    placeholder={placeholder}
                    showClear={item.showClear}
                    disabled={item.disabled}
                    aria-invalid={item.invalid ? "true" : undefined}
                    className={cn(item.inputClassName, item.formInputClassName)}
                />
                <ComboboxContent className={item.contentClassName}>
                    <ComboboxEmpty className={item.emptyClassName}>{emptyText}</ComboboxEmpty>
                    <ComboboxList className={item.listClassName}>
                        {(option: string) => (
                            <ComboboxItem key={option} value={option}>
                                {option}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </div>
    );
}

function ComboboxRenderer({ item }: LayoutRendererProps<ComboboxLayoutItem>) {
    const defaultPreview = useMemo(
        () => (item.multiple ? (Array.isArray(item.defaultValue) ? item.defaultValue : []) : item.defaultValue),
        [item.defaultValue, item.multiple],
    );
    const [previewValue, setPreviewValue] = useState<string | string[] | undefined>(defaultPreview);

    return (
        <ConnectedFormField
            item={item}
            renderPreview={() => (
                <ComboboxControl item={item} value={previewValue} onValueChange={setPreviewValue} />
            )}
            renderControl={(field) => (
                <ComboboxControl
                    item={item}
                    value={
                        item.multiple
                            ? (Array.isArray(field.value) ? field.value : [])
                            : (typeof field.value === "string" ? field.value : "")
                    }
                    onValueChange={field.onChange}
                />
            )}
        />
    );
}

export default ComboboxRenderer;
export type { ComboboxItem } from "./types";
