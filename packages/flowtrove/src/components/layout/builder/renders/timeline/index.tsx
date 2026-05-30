"use client";

import { cn } from "@workspace/ui/lib/utils";

import type { LayoutRendererProps } from "../../types";
import type { TimelineItem } from "./types";

function TimelineRenderer({ item }: LayoutRendererProps<TimelineItem>) {
    return (<div className={cn("rounded-md border border-dashed p-4 text-sm text-muted-foreground", item.className)} style={item.style}>Timeline — implement renderer</div>);
}

export default TimelineRenderer;
export type { TimelineItem };
