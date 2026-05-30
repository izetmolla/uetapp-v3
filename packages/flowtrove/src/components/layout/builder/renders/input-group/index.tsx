"use client";

import { cn } from "@workspace/ui/lib/utils";

import type { LayoutRendererProps } from "../../types";
import type { InputGroupItem } from "./types";

function InputGroupRenderer({ item }: LayoutRendererProps<InputGroupItem>) {
    return (<div className={cn("rounded-md border border-dashed p-4 text-sm text-muted-foreground", item.className)} style={item.style}>InputGroup — implement renderer</div>);
}

export default InputGroupRenderer;
export type { InputGroupItem };
