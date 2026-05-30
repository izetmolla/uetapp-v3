import type { BaseFormFieldItem } from "../../types/items-types";

export type InputItem = BaseFormFieldItem & {
    type: "input";
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
