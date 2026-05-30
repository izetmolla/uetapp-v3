import type { BaseLayoutItem } from "../../types/base-layout";

export type CalendarItem = BaseLayoutItem & {
    type: "calendar";
    children?: unknown[];
};
