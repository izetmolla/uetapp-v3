"use client";

import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Label } from "@workspace/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form";
import type { LayoutRendererProps } from "../../types";
import { FormFieldPreview } from "../../lib/form-field-preview";
import { useLayoutForm } from "../../lib/use-layout-form";
import type { RadioGroupItem as RadioGroupLayoutItem } from "./types";

function RadioOptions({
    item,
    value,
    onValueChange,
}: {
    item: RadioGroupLayoutItem;
    value: string;
    onValueChange: (value: string) => void;
}) {
    const options = item.options ?? [];

    return (
        <RadioGroup
            value={value}
            onValueChange={onValueChange}
            disabled={item.disabled}
            className={cn("grid gap-2", item.className)}
        >
            {options.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                    <RadioGroupItem value={opt.value} id={`${item.id}-${opt.value}`} />
                    <Label htmlFor={`${item.id}-${opt.value}`}>{opt.label}</Label>
                </div>
            ))}
        </RadioGroup>
    );
}

function RadioGroupRenderer({ item }: LayoutRendererProps<RadioGroupLayoutItem>) {
    const form = useLayoutForm();
    const [previewValue, setPreviewValue] = useState(item.defaultValue ?? "");

    if (form) {
        return (
            <FormField
                control={form.control}
                name={item.name}
                render={({ field }) => (
                    <FormItem style={item.style}>
                        {item.label ? <FormLabel>{item.label}</FormLabel> : null}
                        <FormControl>
                            <RadioOptions
                                item={item}
                                value={(field.value as string | undefined) ?? ""}
                                onValueChange={field.onChange}
                            />
                        </FormControl>
                        {item.description ? <FormDescription>{item.description}</FormDescription> : null}
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    }

    return (
        <FormFieldPreview item={item}>
            <RadioOptions item={item} value={previewValue} onValueChange={setPreviewValue} />
        </FormFieldPreview>
    );
}

export default RadioGroupRenderer;
export type { RadioGroupItem } from "./types";
