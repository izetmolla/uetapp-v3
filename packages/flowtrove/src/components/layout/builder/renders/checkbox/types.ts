import type { BaseFormFieldItem } from "../../types/items-types";

export type CheckboxItem = BaseFormFieldItem & {
    type: "checkbox";
    placeholder?: string;
    defaultValue?: string;
    inputType?: string;
    defaultChecked?: boolean;
    rows?: number;
    min?: number;
    max?: number;
    step?: number;
    size?: "default" | "sm";
};
