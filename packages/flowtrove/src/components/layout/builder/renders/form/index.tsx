"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";
import { Form } from "@workspace/ui/components/form";
import type { LayoutRendererProps } from "../../types";
import { LayoutBuilderContext, useLayoutBuilderContext } from "../../LayoutBuilderContext";
import { buildDefaultValues, buildFormSchema, getFormFieldNames } from "../../lib/form";
import {
    applyZodErrors,
    handleFormSubmitError,
    usesRequestBody,
} from "../../lib/form-submit";
import type { FormItem } from "./types";

function FormRenderer({ item, renderItems, path }: LayoutRendererProps<FormItem>) {
    const parentContext = useLayoutBuilderContext();
    const children = item.children ?? [];
    const [formError, setFormError] = useState<string | null>(null);

    const schema = useMemo(() => buildFormSchema(children), [children]);
    const defaultValues = useMemo(() => buildDefaultValues(children), [children]);
    const fieldNames = useMemo(() => getFormFieldNames(children), [children]);

    const form = useForm<Record<string, unknown>>({
        defaultValues,
        mode: "onSubmit",
    });

    const submitValues = async (values: Record<string, unknown>) => {
        const method = (item.method ?? "POST").toUpperCase();

        if (item.action && parentContext.axios) {
            if (usesRequestBody(method)) {
                await parentContext.axios.request({
                    url: item.action,
                    method: method as "POST" | "PUT" | "PATCH" | "DELETE",
                    data: values,
                });
            } else {
                await parentContext.axios.request({
                    url: item.action,
                    method: "GET",
                    params: values,
                });
            }
        }

        if (item.showSuccessToast) {
            toast.success(item.successMessage ?? "Form submitted successfully");
        }

        if (item.onSubmitAction === "reset") {
            form.reset(defaultValues);
        } else if (item.onSubmitAction === "redirect" && item.redirectUrl) {
            window.location.assign(item.redirectUrl);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.clearErrors();
        setFormError(null);

        const values = form.getValues();
        const parsed = schema.safeParse(values);

        if (!parsed.success) {
            applyZodErrors(form, parsed.error.issues);
            return;
        }

        try {
            await submitValues(parsed.data);
        } catch (error) {
            handleFormSubmitError(error, form, fieldNames, {
                showErrorAsToast: item.showErrorAsToast,
                setFormError,
            });
        }
    };

    const contextValue = useMemo(
        () => ({ ...parentContext, form }),
        [parentContext, form],
    );

    return (
        <LayoutBuilderContext.Provider value={contextValue}>
            <Form {...form}>
                <form
                    name={item.name}
                    action={item.action}
                    method={item.method?.toLowerCase()}
                    encType={item.encType}
                    noValidate
                    onSubmit={handleSubmit}
                    className={cn("space-y-4", item.className)}
                    style={item.style}
                >
                    {formError ? (
                        <div
                            role="alert"
                            className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                        >
                            {formError}
                        </div>
                    ) : null}
                    {renderItems(children, path)}
                </form>
            </Form>
        </LayoutBuilderContext.Provider>
    );
}

export default FormRenderer;
export type { FormItem } from "./types";
