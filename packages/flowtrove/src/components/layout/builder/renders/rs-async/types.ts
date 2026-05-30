import type { BaseFormFieldItem } from "../../types/items-types";

export type RsAsyncItem = BaseFormFieldItem & {
    type: "rs-async";
    options?: { value: string; label: string }[];
    loadOptionsUrl?: string;
    placeholder?: string;
    defaultValue?: string;
    multi?: boolean;
};
