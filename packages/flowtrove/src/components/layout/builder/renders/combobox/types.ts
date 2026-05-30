import type { BaseFormFieldItem } from "../../types/items-types";

/** Combobox — searchable select with optional multi-value chips. */
export type ComboboxItem = BaseFormFieldItem & {
    type: "combobox";
    /** Options shown in the list (strings). */
    items: string[];
    placeholder?: string;
    defaultValue?: string | string[];
    emptyText?: string;
    showClear?: boolean;
    invalid?: boolean;
    autoHighlight?: boolean;
    multiple?: boolean;
    inputClassName?: string;
    contentClassName?: string;
    emptyClassName?: string;
    listClassName?: string;
};
