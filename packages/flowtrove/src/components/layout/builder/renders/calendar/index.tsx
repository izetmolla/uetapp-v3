"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Calendar } from "@workspace/ui/components/calendar";
import type { LayoutRendererProps } from "../../types";
import type { CalendarItem } from "./types";

function CalendarRenderer({ item }: LayoutRendererProps<CalendarItem>) {
    return <Calendar className={cn(item.className)} style={item.style} />;
}

export default CalendarRenderer;
export type { CalendarItem };
