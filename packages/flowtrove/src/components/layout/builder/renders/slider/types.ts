import type { BaseFormFieldItem } from "../../types/items-types";

export type SliderItem = BaseFormFieldItem & {
    type: "slider";
    defaultValue?: number[];
    min?: number;
    max?: number;
    step?: number;
};
