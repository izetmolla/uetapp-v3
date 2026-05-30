import type { BaseFormFieldItem } from "../../types/items-types";

export type CheckboxItem = BaseFormFieldItem & {
    type: "checkbox";
    checked?: boolean;
    defaultChecked?: boolean;
    required?: boolean;
    invalid?: boolean;
};
