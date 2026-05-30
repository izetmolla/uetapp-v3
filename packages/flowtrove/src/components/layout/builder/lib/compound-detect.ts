import type { LayoutBuilderItem } from "../types/items";

/** True when `children` contains any item whose `type` is in `slotTypes`. */
export function childrenUseComposedSlots(
    children: LayoutBuilderItem[] | undefined,
    slotTypes: readonly string[],
): boolean {
    if (!children?.length) {
        return false;
    }
    const slots = new Set(slotTypes);
    return children.some((c) => slots.has(c.type));
}
