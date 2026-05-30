"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Progress } from "@workspace/ui/components/progress";
import type { LayoutRendererProps } from "../../types";
import type { ProgressItem } from "./types";

function ProgressRenderer({ item }: LayoutRendererProps<ProgressItem>) {
    return <Progress value={item.value ?? 0} className={cn(item.className)} style={item.style} />;
}

export default ProgressRenderer;
export type { ProgressItem };
