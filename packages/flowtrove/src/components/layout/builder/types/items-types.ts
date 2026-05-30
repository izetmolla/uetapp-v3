import type { CSSProperties } from "react";
import type { FieldValidation } from "../lib/form/types";

/** Shared props for layout items bound to react-hook-form fields. */
export type BaseFormFieldItem = {
    type: string;
    id: string;
    /** Form field name (react-hook-form key). */
    name: string;
    className?: string;
    style?: CSSProperties;
    condition?: string;
    locked?: boolean;
    label?: string;
    description?: string;
    placeholder?: string;
    validation?: FieldValidation;
    disabled?: boolean;
    /** Per-slot class names when rendered inside a connected `form` item. */
    formMessageClassName?: string;
    formDescriptionClassName?: string;
    formLabelClassName?: string;
    formControlClassName?: string;
    formInputClassName?: string;
    formSelectClassName?: string;
    formCheckboxClassName?: string;
    formRadioClassName?: string;
    formSwitchClassName?: string;
    formTextareaClassName?: string;
};
