"use client";

import type { FC } from "react";
import { ToggleGroup, ToggleGroupItem } from "@workspace/ui/components/toggle-group";
import { cn } from "@workspace/ui/lib/utils";
import type { LayoutRendererProps } from "../../types";
import type { LayoutBuilderItem } from "../../types/items";
import type { ToggleGroupLayoutItem, ToggleGroupMemberItem } from "./types";

const ToggleGroupRenderer: FC<LayoutRendererProps<ToggleGroupLayoutItem>> = ({
    item,
    renderItems,
    path,
}) => {
    const children = item.children ?? [];
    const slots = children.filter(
        (c): c is ToggleGroupMemberItem => c.type === "toggle-group-item",
    );

    if (slots.length > 0) {
        return (
            <ToggleGroup
                type={item.groupType ?? "single"}
                variant={item.variant}
                size={item.size}
                className={cn(item.className)}
                style={item.style}
            >
                {slots.map((slot) => (
                    <ToggleGroupItem key={slot.id} value={slot.value}>
                        {slot.text}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        );
    }

    return (
        <ToggleGroup
            type={item.groupType ?? "single"}
            variant={item.variant}
            size={item.size}
            className={cn(item.className)}
            style={item.style}
        >
            {renderItems(children as LayoutBuilderItem[], path)}
        </ToggleGroup>
    );
};

const ToggleGroupMemberRenderer: FC<LayoutRendererProps<ToggleGroupMemberItem>> = ({ item }) => (
    <ToggleGroupItem value={item.value} className={cn(item.className)} style={item.style}>
        {item.text}
    </ToggleGroupItem>
);

export default ToggleGroupRenderer;
export { ToggleGroupMemberRenderer };
export type { ToggleGroupLayoutItem, ToggleGroupMemberItem };
