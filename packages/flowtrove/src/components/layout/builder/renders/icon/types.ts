import type { BaseLayoutItem } from "../../types/base-layout";

export type IconItem = BaseLayoutItem & {
    type: "icon";
    name: string;
};
