import type { HTMLAttributes } from "react";
import type { ContainerItem } from "../../types/items";

/** Native HTML div element attributes (role, aria-*, data-*, etc.) */
export type DivElementProperties = Omit<HTMLAttributes<HTMLDivElement>, "children">;

/**
 * Div – native div container (no shadcn component)
 * | Element | Item prop(s)     | Notes                          |
 * |---------|------------------|--------------------------------|
 * | Root    | className, style | ContainerItem + HTML div attrs |
 * | Content | children         | main content                   |
 */
export type DivItem = ContainerItem & DivElementProperties & {
    type: "div";
};
