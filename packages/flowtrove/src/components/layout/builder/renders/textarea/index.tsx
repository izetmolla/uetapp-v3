"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Textarea } from "@workspace/ui/components/textarea";
import type { LayoutRendererProps } from "../../types";
import type { TextareaItem } from "./types";
import { ConnectedFormField } from "../../lib/connected-form-field";

function TextareaRenderer({ item }: LayoutRendererProps<TextareaItem>) {
    return (
        <ConnectedFormField
            item={item}
            renderPreview={() => (
                <Textarea
                    placeholder={item.placeholder}
                    defaultValue={item.defaultValue}
                    disabled={item.disabled}
                    rows={item.rows}
                    className={cn(item.className)}
                />
            )}
            renderControl={(field) => (
                <Textarea
                    {...field}
                    placeholder={item.placeholder}
                    disabled={item.disabled}
                    rows={item.rows}
                    value={(field.value as string | undefined) ?? ""}
                />
            )}
        />
    );
}

export default TextareaRenderer;
export type { TextareaItem };
