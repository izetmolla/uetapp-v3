import type { BaseFormFieldItem } from "../../types/items-types";

/** Password field with optional show/hide toggle. */
export type PasswordInputItem = BaseFormFieldItem & {
    type: "password-input";
    placeholder?: string;
    required?: boolean;
    inputId?: string;
    invalid?: boolean;
    defaultValue?: string;
    /** Show eye icon to toggle visibility (default true). */
    showVisibilityToggle?: boolean;
    size?: "default" | "sm";
};
