"use client";

import { cn } from "@workspace/ui/lib/utils";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import type { LayoutRendererProps } from "../../types";
import type { ScrollAreaItem } from "./types";

function ScrollAreaRenderer({ item, renderItems, path }: LayoutRendererProps<ScrollAreaItem>) {
    const children = item.children ?? [];
    return (<ScrollArea className={cn(item.className)} style={item.style}>{renderItems(children, path)}</ScrollArea>);
}

export default ScrollAreaRenderer;
export type { ScrollAreaItem };
