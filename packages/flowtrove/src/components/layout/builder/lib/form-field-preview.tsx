"use client";

import { cn } from "@workspace/ui/lib/utils";
import type { BaseFormFieldItem } from "../types/items-types";

type FormFieldPreviewProps = {
    item: Pick<BaseFormFieldItem, "label" | "description" | "className" | "style">;
    children: React.ReactNode;
};

/** Preview shell for form fields outside react-hook-form (LayoutBuilder canvas). */
export function FormFieldPreview({ item, children }: FormFieldPreviewProps) {
    return (
        <div className={cn("space-y-2", item.className)} style={item.style}>
            {item.label ? (
                <label className="text-sm font-medium leading-none">{item.label}</label>
            ) : null}
            {children}
            {item.description ? (
                <p className="text-sm text-muted-foreground">{item.description}</p>
            ) : null}
        </div>
    );
}
