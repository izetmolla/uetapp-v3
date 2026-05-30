import type { BaseLayoutItem } from "../../types/base-layout";

export type InputGroupItem = BaseLayoutItem & {
    type: "input-group";
    children?: unknown[];
};
