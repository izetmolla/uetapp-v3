"use client";

import { cn } from "@workspace/ui/lib/utils";

import type { LayoutRendererProps } from "../../types";
import type { BadgeItem } from "./types";

function BadgeRenderer({ item }: LayoutRendererProps<BadgeItem>) {
    return (<div className={cn("rounded-md border border-dashed p-4 text-sm text-muted-foreground", item.className)} style={item.style}>Badge — implement renderer</div>);
}

export default BadgeRenderer;
export type { BadgeItem };
