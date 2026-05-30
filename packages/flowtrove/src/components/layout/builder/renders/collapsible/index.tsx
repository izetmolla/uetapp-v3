"use client";

import type { FC } from "react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { cn } from "@workspace/ui/lib/utils";
import type { LayoutRendererProps } from "../../types";
import { childrenUseComposedSlots } from "../../lib/compound-detect";
import type {
    CollapsibleContentItem,
    CollapsibleItem,
    CollapsibleTriggerItem,
} from "./types";

const SLOTS = ["collapsible-trigger", "collapsible-content"] as const;

const CollapsibleRenderer: FC<LayoutRendererProps<CollapsibleItem>> = ({
    item,
    renderItems,
    path,
}) => {
    const children = item.children ?? [];

    if (childrenUseComposedSlots(children, SLOTS)) {
        return (
            <Collapsible
                defaultOpen={item.open}
                className={cn(item.className)}
                style={item.style}
            >
                {renderItems(children, path)}
            </Collapsible>
        );
    }

    return (
        <Collapsible defaultOpen={item.open} className={cn(item.className)} style={item.style}>
            <CollapsibleTrigger className="text-sm font-medium">
                {item.triggerLabel ?? "Toggle"}
            </CollapsibleTrigger>
            <CollapsibleContent>{renderItems(children, path)}</CollapsibleContent>
        </Collapsible>
    );
};

const CollapsibleTriggerRenderer: FC<LayoutRendererProps<CollapsibleTriggerItem>> = ({
    item,
    renderItems,
    path,
}) => (
    <CollapsibleTrigger className={cn(item.className)} style={item.style} asChild>
        <div>{renderItems(item.children ?? [], path)}</div>
    </CollapsibleTrigger>
);

const CollapsibleContentRenderer: FC<LayoutRendererProps<CollapsibleContentItem>> = ({
    item,
    renderItems,
    path,
}) => (
    <CollapsibleContent className={cn(item.className)} style={item.style}>
        {renderItems(item.children ?? [], path)}
    </CollapsibleContent>
);

export default CollapsibleRenderer;
export { CollapsibleTriggerRenderer, CollapsibleContentRenderer };
export type { CollapsibleItem, CollapsibleTriggerItem, CollapsibleContentItem };
