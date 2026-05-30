"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Toaster } from "@workspace/ui/components/sonner";
import type { LayoutRendererProps } from "../../types";
import type { SonnerItem } from "./types";

function SonnerRenderer({ item }: LayoutRendererProps<SonnerItem>) {
    return <Toaster position={item.position} className={cn(item.className)} />;
}

export default SonnerRenderer;
export type { SonnerItem };
