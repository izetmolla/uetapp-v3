import type { BaseFormFieldItem } from "../../types/items-types";

export type TextareaItem = BaseFormFieldItem & {
    type: "textarea";
    placeholder?: string;
    defaultValue?: string;
    rows?: number;
    invalid?: boolean;
    required?: boolean;
};
