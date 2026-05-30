import type { BaseLayoutItem } from "../../types/base-layout";

export type DropdownMenuItem = BaseLayoutItem & {
    type: "dropdown-menu";
    children?: unknown[];
};
