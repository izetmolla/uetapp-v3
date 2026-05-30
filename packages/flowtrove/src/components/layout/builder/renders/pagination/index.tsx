"use client";

import { cn } from "@workspace/ui/lib/utils";

import type { LayoutRendererProps } from "../../types";
import type { PaginationItem } from "./types";

function PaginationRenderer({ item }: LayoutRendererProps<PaginationItem>) {
    return (<div className={cn("rounded-md border border-dashed p-4 text-sm text-muted-foreground", item.className)} style={item.style}>Pagination — implement renderer</div>);
}

export default PaginationRenderer;
export type { PaginationItem };
