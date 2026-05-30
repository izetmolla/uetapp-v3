import type { BaseFormFieldItem } from "../../types/items-types";

export type RsCreatableItem = BaseFormFieldItem & {
    type: "rs-creatable";
    options?: { value: string; label: string }[];
    placeholder?: string;
    defaultValue?: string | string[];
    multi?: boolean;
};
