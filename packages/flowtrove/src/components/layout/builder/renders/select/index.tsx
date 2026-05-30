"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { cn } from "@workspace/ui/lib/utils";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form";
import {
    Select,
    SelectContent,
    SelectItem as SelectOptionItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import type { LayoutRendererProps } from "../../types";
import { fromSafeSelectValue, safeSelectValue } from "../../lib/select-value";
import { useLayoutForm } from "../../lib/use-layout-form";
import { useSelectOptions } from "./use-select-options";
import type { SelectItem } from "./types";

type SelectControlProps = {
    item: SelectItem;
    value: string;
    onValueChange: (value: string) => void;
    disabled?: boolean;
};

function SelectControl({ item, value, onValueChange, disabled }: SelectControlProps) {
    const { options, isLoading } = useSelectOptions(item);
    const {
        placeholder = "Select…",
        size = "default",
        clearable,
        className,
    } = item;

    const selectValue =
        value === ""
            ? (() => {
                const idx = options.findIndex((o) => o.value === "");
                return idx >= 0 ? safeSelectValue("", idx) : "";
            })()
            : value;

    return (
        <Select
            value={selectValue}
            onValueChange={(v) => onValueChange(fromSafeSelectValue(v))}
            disabled={disabled || isLoading}
        >
            <SelectTrigger
                className={cn(className)}
                size={size}
                cloarable={clearable}
                handleClear={clearable ? () => onValueChange("") : undefined}
            >
                <SelectValue placeholder={isLoading ? "Loading…" : placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((opt, idx) => {
                    const safe = safeSelectValue(opt.value, idx);
                    return (
                        <SelectOptionItem key={safe} value={safe}>
                            {opt.label}
                        </SelectOptionItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
}

function SelectField({ item, form }: { item: SelectItem; form: UseFormReturn<Record<string, unknown>> }) {
    return (
        <FormField
            control={form.control}
            name={item.name}
                render={({ field }) => (
                    <FormItem className={cn(item.className)} style={item.style}>
                        {item.label ? <FormLabel className={item.formLabelClassName}>{item.label}</FormLabel> : null}
                        <FormControl className={item.formControlClassName}>
                            <SelectControl
                                item={item}
                                value={(field.value as string | undefined) ?? ""}
                                onValueChange={field.onChange}
                                disabled={item.disabled}
                            />
                        </FormControl>
                        {item.description ? (
                            <FormDescription className={item.formDescriptionClassName}>
                                {item.description}
                            </FormDescription>
                        ) : null}
                        <FormMessage className={item.formMessageClassName} />
                    </FormItem>
                )}
        />
    );
}

function SelectRenderer({ item }: LayoutRendererProps<SelectItem>) {
    const form = useLayoutForm();
    const [value, setValue] = useState(item.defaultValue ?? "");

    if (form) {
        return <SelectField item={item} form={form} />;
    }

    const { label, description, disabled, className, style } = item;

    return (
        <div className={cn("space-y-2", className)} style={style}>
            {label ? <label className="text-sm font-medium leading-none">{label}</label> : null}
            <SelectControl item={item} value={value} onValueChange={setValue} disabled={disabled} />
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
    );
}

export default SelectRenderer;
export type { SelectItem, SelectOption } from "./types";
