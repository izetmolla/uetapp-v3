import type { BaseLayoutItem } from "../../types/base-layout";

export type BadgeItem = BaseLayoutItem & {
    type: "badge";
    text: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
};
