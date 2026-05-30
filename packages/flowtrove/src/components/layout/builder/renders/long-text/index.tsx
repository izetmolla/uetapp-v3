"use client";

import { cn } from "@workspace/ui/lib/utils";
import LongText from "@workspace/ui/components/long-text";
import type { LayoutRendererProps } from "../../types";
import type { LongTextItem } from "./types";

function LongTextRenderer({ item }: LayoutRendererProps<LongTextItem>) {
    return <LongText className={cn(item.className)}>{item.text}</LongText>;
}

export default LongTextRenderer;
export type { LongTextItem };
