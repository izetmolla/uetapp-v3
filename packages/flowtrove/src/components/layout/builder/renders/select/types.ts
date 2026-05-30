import type { FetchOptions } from "../../types/fetch-options";
import type { BaseFormFieldItem } from "../../types/items-types";

/** Select option */
export type SelectOption = { value: string; label: string };

/**
 * Select – maps to shadcn Select
 * | Shadcn element  | Item prop(s) | Notes          |
 * |-----------------|--------------|----------------|
 * | Select          | defaultValue | preview / form default |
 * | SelectTrigger   | placeholder, size |           |
 * | SelectContent   | options      |                |
 * | SelectItem      | options[].value, options[].label |  |
 */
export type SelectItem = BaseFormFieldItem & {
    type: "select";
    /** Static options (merged with fetched options unless replaceOptions). */
    options?: SelectOption[];
    /** Placeholder when nothing selected. */
    placeholder?: string;
    /** Default / initial value. */
    defaultValue?: string;
    /** Load options from API via LayoutBuilder axios + query client. */
    fetchOptions?: FetchOptions;
    /** When true, fetched options replace static options. */
    replaceOptions?: boolean;
    /** SelectTrigger size. */
    size?: "default" | "sm";
    /** Show clear control on trigger. */
    clearable?: boolean;
};
