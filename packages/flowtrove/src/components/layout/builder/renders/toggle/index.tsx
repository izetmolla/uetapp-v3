"use client";

import { cn } from "@workspace/ui/lib/utils";

import type { LayoutRendererProps } from "../../types";
import type { ToggleItem } from "./types";

function ToggleRenderer({ item }: LayoutRendererProps<ToggleItem>) {
    return (<div className={cn("rounded-md border border-dashed p-4 text-sm text-muted-foreground", item.className)} style={item.style}>Toggle — implement renderer</div>);
}

export default ToggleRenderer;
export type { ToggleItem };
