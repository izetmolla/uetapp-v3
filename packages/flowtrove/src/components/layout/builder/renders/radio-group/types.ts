import type { BaseFormFieldItem } from "../../types/items-types";

export type RadioGroupItem = BaseFormFieldItem & {
    type: "radio-group";
    options?: { value: string; label: string }[];
    defaultValue?: string;
};
