"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Slider } from "@workspace/ui/components/slider";
import type { LayoutRendererProps } from "../../types";
import type { SliderItem } from "./types";
import { ConnectedFormField } from "../../lib/connected-form-field";

function SliderRenderer({ item }: LayoutRendererProps<SliderItem>) {
    const defaultSliderValue = item.defaultValue ?? [50];

    return (
        <ConnectedFormField
            item={item}
            renderPreview={() => (
                <Slider
                    defaultValue={defaultSliderValue}
                    min={item.min ?? 0}
                    max={item.max ?? 100}
                    step={item.step ?? 1}
                    disabled={item.disabled}
                    className={cn(item.className)}
                />
            )}
            renderControl={(field) => {
                const value = Array.isArray(field.value)
                    ? (field.value as number[])
                    : defaultSliderValue;

                return (
                    <Slider
                        value={value}
                        onValueChange={field.onChange}
                        min={item.min ?? 0}
                        max={item.max ?? 100}
                        step={item.step ?? 1}
                        disabled={item.disabled}
                        className={cn(item.className)}
                    />
                );
            }}
        />
    );
}

export default SliderRenderer;
export type { SliderItem };
