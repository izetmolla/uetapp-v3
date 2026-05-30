"use client";

import type { UseFormReturn } from "react-hook-form";
import { useLayoutBuilderContext } from "../LayoutBuilderContext";

/** Returns the active RHF instance when inside a layout `form` item, otherwise undefined. */
export function useLayoutForm(): UseFormReturn<Record<string, unknown>> | undefined {
    return useLayoutBuilderContext().form;
}
