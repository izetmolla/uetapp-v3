import type { FetchOptions } from "../../types/fetch-options";
import type { BaseFormFieldItem } from "../../types/items-types";
import type { SelectOptionsSource } from "../../lib/select-options-source";

/** Select option */
export type SelectOption = { value: string; label: string };

/**
 * Select – maps to shadcn Select
 * | Shadcn element  | Item prop(s) | Notes          |
 * |-----------------|--------------|----------------|
 * | Select          | defaultValue | preview / form default |
 * | SelectTrigger   | placeholder, size |           |
 * | SelectContent   | options      | static array or HTTP descriptor |
 * | SelectItem      | options[].value, options[].label |  |
 */
export type SelectItem = BaseFormFieldItem & {
    type: "select";
    /**
     * Static `{ value, label }[]`, or HTTP descriptor:
     * `{ "url": "/api/countries", "method": "get", "params": { ... } }`
     */
    options?: SelectOptionsSource;
    /** Placeholder when nothing selected. */
    placeholder?: string;
    /** Default / initial value. */
    defaultValue?: string;
    /** @deprecated Prefer object-form `options`. Kept for backward compatibility. */
    fetchOptions?: FetchOptions;
    /** When true, fetched options replace static options. */
    replaceOptions?: boolean;
    /** SelectTrigger size. */
    size?: "default" | "sm";
    /** Show clear control on trigger. */
    clearable?: boolean;
};
