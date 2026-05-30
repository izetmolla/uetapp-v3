"use client";

import type { ReactNode } from "react";
import type { ControllerRenderProps, FieldValues } from "react-hook-form";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form";
import { cn } from "@workspace/ui/lib/utils";
import type { BaseFormFieldItem } from "../types/items-types";
import { FormFieldPreview } from "./form-field-preview";
import { useLayoutForm } from "./use-layout-form";

type FormFieldShellItem = Pick<
    BaseFormFieldItem,
    | "name"
    | "label"
    | "description"
    | "className"
    | "style"
    | "formLabelClassName"
    | "formDescriptionClassName"
    | "formControlClassName"
    | "formMessageClassName"
>;

type ConnectedFormFieldProps = {
    item: FormFieldShellItem;
    renderPreview: () => ReactNode;
    renderControl: (field: ControllerRenderProps<FieldValues, string>) => ReactNode;
    itemClassName?: string;
};

/** Renders a connected RHF field inside a `form` item, or preview mode otherwise. */
export function ConnectedFormField({
    item,
    renderPreview,
    renderControl,
    itemClassName,
}: ConnectedFormFieldProps) {
    const form = useLayoutForm();

    if (!form) {
        return <FormFieldPreview item={item}>{renderPreview()}</FormFieldPreview>;
    }

    return (
        <FormField
            control={form.control}
            name={item.name}
            render={({ field }) => (
                <FormItem className={cn(item.className, itemClassName)} style={item.style}>
                    {item.label ? (
                        <FormLabel className={item.formLabelClassName}>{item.label}</FormLabel>
                    ) : null}
                    <FormControl className={item.formControlClassName}>
                        {renderControl(field)}
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
