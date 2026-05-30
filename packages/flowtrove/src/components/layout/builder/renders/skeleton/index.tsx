"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Skeleton } from "@workspace/ui/components/skeleton";
import type { LayoutRendererProps } from "../../types";
import type { SkeletonItem } from "./types";

function SkeletonRenderer({ item }: LayoutRendererProps<SkeletonItem>) {
    return <Skeleton className={cn(item.className)} style={item.style} />;
}

export default SkeletonRenderer;
export type { SkeletonItem };
