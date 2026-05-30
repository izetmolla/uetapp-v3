"use client";

import type { FC } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";
import type { LayoutRendererProps } from "../../types";
import { childrenUseComposedSlots } from "../../lib/compound-detect";
import type { TooltipContentItem, TooltipItem, TooltipTriggerItem } from "./types";

const SLOTS = ["tooltip-trigger", "tooltip-content"] as const;

const TooltipRenderer: FC<LayoutRendererProps<TooltipItem>> = ({ item, renderItems, path }) => {
    const children = item.children ?? [];

    if (childrenUseComposedSlots(children, SLOTS)) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <div className={cn("inline-block", item.className)} style={item.style}>
                        {renderItems(children, path)}
                    </div>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild className={cn(item.className)} style={item.style}>
                    <span>{renderItems(children, path)}</span>
                </TooltipTrigger>
                {item.content ? <TooltipContent>{item.content}</TooltipContent> : null}
            </Tooltip>
        </TooltipProvider>
    );
};

const TooltipTriggerRenderer: FC<LayoutRendererProps<TooltipTriggerItem>> = ({
    item,
    renderItems,
    path,
}) => (
    <TooltipTrigger asChild className={cn(item.className)}>
        <span>{renderItems(item.children ?? [], path)}</span>
    </TooltipTrigger>
);

const TooltipContentRenderer: FC<LayoutRendererProps<TooltipContentItem>> = ({ item }) => (
    <TooltipContent className={cn(item.className)} style={item.style}>
        {item.text}
    </TooltipContent>
);

export default TooltipRenderer;
export { TooltipTriggerRenderer, TooltipContentRenderer };
export type { TooltipItem, TooltipTriggerItem, TooltipContentItem };
