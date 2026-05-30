import type { BaseFormFieldItem } from "../../types/items-types";

export type MultiSelectOption = { value: string; label: string };

/** Checkbox list for multiple string values. */
export type MultiSelectItem = BaseFormFieldItem & {
    type: "multi-select";
    options: MultiSelectOption[];
    defaultValue?: string[];
    placeholder?: string;
};
