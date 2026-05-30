import type { BaseFormFieldItem } from "../../types/items-types";

export type RsFixedItem = BaseFormFieldItem & {
    type: "rs-fixed";
    options?: { value: string; label: string }[];
    placeholder?: string;
    defaultValue?: string | string[];
    multi?: boolean;
};
