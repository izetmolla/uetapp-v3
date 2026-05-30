"use client";

import { cn } from "@workspace/ui/lib/utils";
import Icon from "@workspace/ui/components/icon";
import type { LayoutRendererProps } from "../../types";
import type { IconItem } from "./types";

function IconRenderer({ item }: LayoutRendererProps<IconItem>) {
    return <Icon name={item.name} className={cn(item.className)} />;
}

export default IconRenderer;
export type { IconItem };
