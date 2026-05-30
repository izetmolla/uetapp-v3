import type { BaseFormFieldItem } from "../../types/items-types";

/** HTML input type attribute */
export type InputType =
    | "text"
    | "password"
    | "email"
    | "number"
    | "search"
    | "tel"
    | "url"
    | "file"
    | "date"
    | "time"
    | "datetime-local";

export type InputItem = BaseFormFieldItem & {
    type: "input";
    placeholder?: string;
    inputType?: InputType;
    required?: boolean;
    inputId?: string;
    invalid?: boolean;
    defaultValue?: string | number;
    labelClassName?: string;
    descriptionClassName?: string;
    size?: "default" | "sm";
};
