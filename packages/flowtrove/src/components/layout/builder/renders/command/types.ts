import type { BaseLayoutItem } from "../../types/base-layout";

export type CommandItem = BaseLayoutItem & {
    type: "command";
    children?: unknown[];
};
