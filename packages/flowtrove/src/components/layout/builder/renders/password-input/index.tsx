"use client";

import { cn } from "@workspace/ui/lib/utils";
import PasswordInput from "@workspace/flowtrove/components/password";
import type { LayoutRendererProps } from "../../types";
import type { PasswordInputItem } from "./types";
import { ConnectedFormField } from "../../lib/connected-form-field";

function PasswordInputRenderer({ item }: LayoutRendererProps<PasswordInputItem>) {
    const inputId = item.inputId ?? item.id;
    const showToggle = item.showVisibilityToggle ?? true;

    return (
        <ConnectedFormField
            item={item}
            renderPreview={() => (
                <PasswordInput
                    id={inputId}
                    placeholder={item.placeholder}
                    defaultValue={item.defaultValue}
                    disabled={item.disabled}
                    required={item.required}
                    showVisibilityToggle={showToggle}
                    aria-invalid={item.invalid || undefined}
                    className={cn(item.className, item.formInputClassName)}
                />
            )}
            renderControl={(field) => (
                <PasswordInput
                    {...field}
                    id={inputId}
                    placeholder={item.placeholder}
                    disabled={item.disabled}
                    required={item.required}
                    showVisibilityToggle={showToggle}
                    aria-invalid={item.invalid || undefined}
                    className={cn(item.formInputClassName)}
                    value={(field.value as string | undefined) ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                />
            )}
        />
    );
}

export default PasswordInputRenderer;
export type { PasswordInputItem } from "./types";
