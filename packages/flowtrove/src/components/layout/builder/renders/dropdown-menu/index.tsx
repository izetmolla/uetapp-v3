"use client";

import { cn } from "@workspace/ui/lib/utils";

import type { LayoutRendererProps } from "../../types";
import type { DropdownMenuItem } from "./types";

function DropdownMenuRenderer({ item }: LayoutRendererProps<DropdownMenuItem>) {
    return (<div className={cn("rounded-md border border-dashed p-4 text-sm text-muted-foreground", item.className)} style={item.style}>DropdownMenu — implement renderer</div>);
}

export default DropdownMenuRenderer;
export type { DropdownMenuItem };
