import type { BaseLayoutItem } from "../../types/base-layout";

export type AvatarItem = BaseLayoutItem & {
    type: "avatar";
    src?: string;
    fallback?: string;
    size?: "default" | "sm" | "lg";
};
