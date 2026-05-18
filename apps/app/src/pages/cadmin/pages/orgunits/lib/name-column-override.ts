import type { ColumnDef } from "@tanstack/react-table";

/** Merged onto the backend `name` column so titles wrap and use the full cell width. */
export const nameColumnTableMeta = {
    className: "!whitespace-normal align-top w-full max-w-none",
} as const;

export function withNameColumnLayout<T>(override: {
    id: string;
} & Partial<ColumnDef<T>>): { id: string } & Partial<ColumnDef<T>> {
    return {
        size: 480,
        minSize: 280,
        ...override,
        meta: {
            ...nameColumnTableMeta,
            ...(override.meta as object | undefined),
        },
    };
}
