import type { BaseFormFieldItem } from "../../types/items-types";

export type SwitchItem = BaseFormFieldItem & {
    type: "switch";
    checked?: boolean;
    defaultChecked?: boolean;
    required?: boolean;
    invalid?: boolean;
    size?: "default" | "sm";
};
