import type { CSSProperties } from "react";
import type { SelectOption } from "../select/types";
import type { BaseFormFieldItem } from "../../types/items-types";

/** Field definition for a single column in a repeatable row (input or select only) */
export type RepeatableFieldDef =
    | {
        type: "input";
        name: string;
        label?: string;
        placeholder?: string;
        inputType?: "text" | "email" | "number" | "password";
    }
    | {
        type: "select";
        name: string;
        label?: string;
        placeholder?: string;
        options: SelectOption[];
    };

/** Repeatable list – array of objects with multiple fields per row. Output is array of items. */
export type RepeatableItem = BaseFormFieldItem & {
    type: "repeatable";
    /** Column/field definitions for each row */
    fields: RepeatableFieldDef[];
    /** Label for the "Add" button */
    addButtonLabel?: string;
    className?: string;
    style?: CSSProperties;
};
