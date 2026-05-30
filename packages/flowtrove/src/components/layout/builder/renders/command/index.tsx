"use client";

import { cn } from "@workspace/ui/lib/utils";

import type { LayoutRendererProps } from "../../types";
import type { CommandItem } from "./types";

function CommandRenderer({ item }: LayoutRendererProps<CommandItem>) {
    return (<div className={cn("rounded-md border border-dashed p-4 text-sm text-muted-foreground", item.className)} style={item.style}>Command — implement renderer</div>);
}

export default CommandRenderer;
export type { CommandItem };
