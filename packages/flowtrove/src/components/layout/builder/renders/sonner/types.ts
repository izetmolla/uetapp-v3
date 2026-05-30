import type { BaseLayoutItem } from "../../types/base-layout";

export type SonnerItem = BaseLayoutItem & {
    type: "sonner";
    position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
};
