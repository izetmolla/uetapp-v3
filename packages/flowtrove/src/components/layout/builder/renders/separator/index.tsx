"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Separator } from "@workspace/ui/components/separator";
import type { LayoutRendererProps } from "../../types";
import type { SeparatorItem } from "./types";

function SeparatorRenderer({ item }: LayoutRendererProps<SeparatorItem>) {
    return <Separator orientation={item.orientation ?? "horizontal"} className={cn(item.className)} style={item.style} />;
}

export default SeparatorRenderer;
export type { SeparatorItem };
