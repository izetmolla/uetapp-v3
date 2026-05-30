"use client";

import { cn } from "@workspace/ui/lib/utils";
import { ButtonGroup } from "@workspace/ui/components/button-group";
import type { LayoutRendererProps } from "../../types";
import type { ButtonGroupItem } from "./types";

function ButtonGroupRenderer({ item, renderItems, path }: LayoutRendererProps<ButtonGroupItem>) {
    const children = item.children ?? [];
    return (<ButtonGroup className={cn(item.className)} style={item.style}>{renderItems(children, path)}</ButtonGroup>);
}

export default ButtonGroupRenderer;
export type { ButtonGroupItem };
