import type { BaseLayoutItem } from "../../types/base-layout";

export type ToggleItem = BaseLayoutItem & {
    type: "toggle";
    children?: unknown[];
};
