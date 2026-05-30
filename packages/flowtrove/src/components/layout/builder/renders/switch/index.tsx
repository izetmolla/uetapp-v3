"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Switch } from "@workspace/ui/components/switch";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form";
import type { LayoutRendererProps } from "../../types";
import type { SwitchItem } from "./types";
import { FormFieldPreview } from "../../lib/form-field-preview";
import { useLayoutForm } from "../../lib/use-layout-form";

function SwitchRenderer({ item }: LayoutRendererProps<SwitchItem>) {
    const form = useLayoutForm();

    if (form) {
        return (
            <FormField
                control={form.control}
                name={item.name}
                render={({ field }) => (
                    <FormItem
                        className={cn("flex flex-row items-center justify-between rounded-lg border p-3", item.className)}
                        style={item.style}
                    >
                        <div className="space-y-0.5">
                            {item.label ? (
                                <FormLabel className={item.formLabelClassName}>{item.label}</FormLabel>
                            ) : null}
                            {item.description ? (
                                <FormDescription className={item.formDescriptionClassName}>
                                    {item.description}
                                </FormDescription>
                            ) : null}
                        </div>
                        <FormControl className={item.formControlClassName}>
                            <Switch
                                checked={!!field.value}
                                onCheckedChange={field.onChange}
                                disabled={item.disabled}
                                className={item.formSwitchClassName}
                            />
                        </FormControl>
                        <FormMessage className={item.formMessageClassName} />
                    </FormItem>
                )}
            />
        );
    }

    return (
        <FormFieldPreview item={item}>
            <Switch defaultChecked={item.defaultChecked} disabled={item.disabled} className={cn(item.className)} />
        </FormFieldPreview>
    );
}

export default SwitchRenderer;
export type { SwitchItem };
