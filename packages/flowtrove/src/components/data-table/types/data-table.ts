import type { DataTableConfig } from "../config/data-table";
import type { FilterItemSchema } from "../lib/parsers";
import type { ColumnSort, Row, RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    interface ColumnMeta<TData extends RowData, TValue> {
        label?: string;
        placeholder?: string;
        variant?: FilterVariant;
        options?: Option[];
        range?: [number, number];
        unit?: string;
        icon?: React.FC<React.SVGProps<SVGSVGElement>>;
        /** When true, this column only appears in Advanced Filters, not in simple column filters. */
        enableOnlyAdvancedFilters?: boolean;
    }
}

export interface Option {
    label: string;
    value: string;
    count?: number;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export type FilterOperator = DataTableConfig["operators"][number];
export type FilterVariant = DataTableConfig["filterVariants"][number];
export type JoinOperator = DataTableConfig["joinOperators"][number];

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, "id"> {
    id: Extract<keyof TData, string>;
}

export interface ExtendedColumnFilter<TData> extends FilterItemSchema {
    id: Extract<keyof TData, string>;
}

export interface DataTableRowAction<TData> {
    row: Row<TData>;
    variant: "quickEdit" | "design" | "view" | "delete";
}

/** Single column filter sent to server (id, value, and optional variant from column meta) */
export interface ServerColumnFilter {
    id: string;
    value: unknown;
    variant?: FilterVariant;
}

/** State passed to server fetch (pagination, sort, filters) */
export interface ServerTableState<TData = unknown> {
    /** page is 1-based; perPage is page size */
    pagination: { page: number; perPage: number };
    sorting: ExtendedColumnSort<TData>[];
    columnFilters: ServerColumnFilter[];
    /** Advanced filter mode: filters + joinOperator */
    filters?: ExtendedColumnFilter<TData>[];
    joinOperator?: JoinOperator;
}

/** Pagination info returned from server fetch */
export interface ServerPaginationMeta {
    pageCount: number;
    total?: number;
    page?: number;
    perPage?: number;
}

export interface UseServerTableDataOptions<TData> {
    /** Fetch data for the current table state. Called on state/URL change. */
    fetch: (state: ServerTableState<TData>) => Promise<{
        data: TData[];
        pagination: ServerPaginationMeta;
    }>;
    /** Base key (array of strings) or function that receives state and returns a query key so refetch runs when params change. */
    queryKey: string[] | ((state: ServerTableState<TData>) => unknown[]);
    /** Default rows per page (URL key: perPage). Prefer over initialPageSize. */
    initialPerPage?: number;
    /** Use advanced filters (filters + joinOperator) from URL */
    enableAdvancedFilter?: boolean;
    /** Column definitions; used to build filter/sort parsers for URL state */
    columnIds?: Set<string>;
    /** When false, query is not run (e.g. client-side mode) */
    enabled?: boolean;
}

/** Column definition returned by backend GET /columns (flowtrove-compatible shape) */
export interface BackendColumnOption {
    label: string;
    value: string;
}

export interface BackendColumnMeta {
    label?: string;
    variant?: string;
    placeholder?: string;
    options?: BackendColumnOption[];
}

export interface BackendColumnDefinition {
    id: string;
    accessorKey: string;
    header: string;
    enableSorting?: boolean;
    enableColumnFilter?: boolean;
    /** When true, column is filterable only in Advanced Filters, not in simple toolbar. */
    enableOnlyAdvancedFilters?: boolean;
    size?: number;
    meta?: BackendColumnMeta;
}

export interface BackendColumnsResponse {
    columns: BackendColumnDefinition[];
}
