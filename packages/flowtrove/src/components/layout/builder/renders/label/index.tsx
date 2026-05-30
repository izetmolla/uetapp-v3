"use client";

import { cn } from "@workspace/ui/lib/utils";

import type { LayoutRendererProps } from "../../types";
import type { LabelItem } from "./types";

function LabelRenderer({ item }: LayoutRendererProps<LabelItem>) {
    return (<div className={cn("rounded-md border border-dashed p-4 text-sm text-muted-foreground", item.className)} style={item.style}>Label — implement renderer</div>);
}

export default LabelRenderer;
export type { LabelItem };
