"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form";
import type { LayoutRendererProps } from "../../types";
import type { CheckboxItem } from "./types";
import { FormFieldPreview } from "../../lib/form-field-preview";
import { useLayoutForm } from "../../lib/use-layout-form";

function CheckboxRenderer({ item }: LayoutRendererProps<CheckboxItem>) {
    const form = useLayoutForm();

    if (form) {
        return (
            <FormField
                control={form.control}
                name={item.name}
                render={({ field }) => (
                    <FormItem
                        className={cn("flex flex-row items-start space-x-3 space-y-0", item.className)}
                        style={item.style}
                    >
                        <FormControl>
                            <Checkbox
                                checked={!!field.value}
                                onCheckedChange={field.onChange}
                                disabled={item.disabled}
                                className={item.formCheckboxClassName}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            {item.label ? (
                                <FormLabel className={item.formLabelClassName}>{item.label}</FormLabel>
                            ) : null}
                            {item.description ? (
                                <FormDescription className={item.formDescriptionClassName}>
                                    {item.description}
                                </FormDescription>
                            ) : null}
                            <FormMessage className={item.formMessageClassName} />
                        </div>
                    </FormItem>
                )}
            />
        );
    }

    return (
        <FormFieldPreview item={item}>
            <Checkbox defaultChecked={item.defaultChecked} disabled={item.disabled} className={cn(item.className)} />
        </FormFieldPreview>
    );
}

export default CheckboxRenderer;
export type { CheckboxItem };
