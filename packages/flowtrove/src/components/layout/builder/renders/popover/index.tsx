"use client";

import type { FC } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";
import type { LayoutRendererProps } from "../../types";
import { childrenUseComposedSlots } from "../../lib/compound-detect";
import type { PopoverContentItem, PopoverItem, PopoverTriggerItem } from "./types";

const SLOTS = ["popover-trigger", "popover-content"] as const;

const PopoverRenderer: FC<LayoutRendererProps<PopoverItem>> = ({ item, renderItems, path }) => {
    const children = item.children ?? [];

    if (childrenUseComposedSlots(children, SLOTS)) {
        return (
            <Popover>
                <div className={cn("inline-block", item.className)} style={item.style}>
                    {renderItems(children, path)}
                </div>
            </Popover>
        );
    }

    const triggerItems = item.trigger ?? [];
    return (
        <Popover>
            <PopoverTrigger asChild className={cn(item.className)}>
                <div className="inline-flex">
                    {triggerItems.length > 0
                        ? renderItems(triggerItems, path ? [...path, 0] : undefined)
                        : null}
                </div>
            </PopoverTrigger>
            <PopoverContent>{renderItems(children, path ? [...path, 1] : undefined)}</PopoverContent>
        </Popover>
    );
};

const PopoverTriggerRenderer: FC<LayoutRendererProps<PopoverTriggerItem>> = ({
    item,
    renderItems,
    path,
}) => (
    <PopoverTrigger asChild className={cn(item.className)}>
        <div className="inline-flex">{renderItems(item.children ?? [], path)}</div>
    </PopoverTrigger>
);

const PopoverContentRenderer: FC<LayoutRendererProps<PopoverContentItem>> = ({
    item,
    renderItems,
    path,
}) => (
    <PopoverContent className={cn(item.className)} style={item.style}>
        {renderItems(item.children ?? [], path)}
    </PopoverContent>
);

export default PopoverRenderer;
export { PopoverTriggerRenderer, PopoverContentRenderer };
export type { PopoverItem, PopoverTriggerItem, PopoverContentItem };
