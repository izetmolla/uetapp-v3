"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Input } from "@workspace/ui/components/input";
import type { LayoutRendererProps } from "../../types";
import type { InputItem } from "./types";
import { ConnectedFormField } from "../../lib/connected-form-field";

function InputRenderer({ item }: LayoutRendererProps<InputItem>) {
    return (
        <ConnectedFormField
            item={item}
            renderPreview={() => (
                <Input
                    type={item.inputType ?? "text"}
                    placeholder={item.placeholder}
                    defaultValue={item.defaultValue}
                    disabled={item.disabled}
                    className={cn(item.className, item.formInputClassName)}
                />
            )}
            renderControl={(field) => (
                <Input
                    {...field}
                    type={item.inputType ?? "text"}
                    placeholder={item.placeholder}
                    disabled={item.disabled}
                    className={cn(item.formInputClassName)}
                    value={(field.value as string | number | undefined) ?? ""}
                    onChange={(e) =>
                        field.onChange(
                            item.inputType === "number" ? e.target.valueAsNumber : e.target.value,
                        )
                    }
                />
            )}
        />
    );
}

export default InputRenderer;
export type { InputItem };
