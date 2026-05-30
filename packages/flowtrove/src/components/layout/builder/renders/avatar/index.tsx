"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import type { LayoutRendererProps } from "../../types";
import type { AvatarItem } from "./types";

function AvatarRenderer({ item }: LayoutRendererProps<AvatarItem>) {
    return (<Avatar className={cn(item.className)} style={item.style} size={item.size}>{item.src ? <AvatarImage src={item.src} alt={item.fallback ?? ""} /> : null}<AvatarFallback>{item.fallback ?? "?"}</AvatarFallback></Avatar>);
}

export default AvatarRenderer;
export type { AvatarItem };
