"use client";

import { useCallback, useState } from "react";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";
import type { LayoutRendererProps } from "../../types";
import { ConnectedFormField } from "../../lib/connected-form-field";
import type { MultiSelectItem } from "./types";

function toggleValue(value: string[], optValue: string): string[] {
    return value.includes(optValue) ? value.filter((v) => v !== optValue) : [...value, optValue];
}

function MultiSelectContent({
    value,
    onValueChange,
    item,
}: {
    value: string[];
    onValueChange: (value: string[]) => void;
    item: MultiSelectItem;
}) {
    const options = item.options ?? [];
    const handleToggle = useCallback(
        (optValue: string) => onValueChange(toggleValue(value, optValue)),
        [value, onValueChange],
    );

    return (
        <div className={cn("grid gap-2", item.className)} style={item.style}>
            {options.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-2">
                    <Checkbox
                        id={`${item.id}-${opt.value}`}
                        checked={value.includes(opt.value)}
                        onCheckedChange={() => handleToggle(opt.value)}
                        disabled={item.disabled}
                        className={item.formCheckboxClassName}
                    />
                    <Label
                        htmlFor={`${item.id}-${opt.value}`}
                        className="cursor-pointer text-sm font-medium leading-none"
                    >
                        {opt.label}
                    </Label>
                </div>
            ))}
        </div>
    );
}

function MultiSelectRenderer({ item }: LayoutRendererProps<MultiSelectItem>) {
    const [previewValue, setPreviewValue] = useState<string[]>(item.defaultValue ?? []);

    return (
        <ConnectedFormField
            item={item}
            renderPreview={() => (
                <MultiSelectContent value={previewValue} onValueChange={setPreviewValue} item={item} />
            )}
            renderControl={(field) => (
                <MultiSelectContent
                    value={Array.isArray(field.value) ? (field.value as string[]) : []}
                    onValueChange={field.onChange}
                    item={item}
                />
            )}
        />
    );
}

export default MultiSelectRenderer;
export type { MultiSelectItem, MultiSelectOption } from "./types";
