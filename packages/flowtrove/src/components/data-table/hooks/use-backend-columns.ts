"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { convertBackendColumns } from "../lib/column-converter";
import type {
  BackendColumnDefinition,
  BackendColumnsResponse,
} from "../types/data-table";

const EMPTY_COLUMN_VISIBILITY: Record<string, boolean> = {};

export interface UseBackendColumnsOptions<TData = Record<string, unknown>> {
  /** Fetch column definitions from the backend. Return { columns } (or response with .columns). */
  fetchColumns: () => Promise<
    BackendColumnsResponse | { columns: BackendColumnDefinition[] }
  >;
  queryKey: unknown[];
  /** Columns to prepend (e.g. select checkbox). */
  prependColumns?: ColumnDef<TData>[];
  /** Columns to append (e.g. actions). */
  appendColumns?: ColumnDef<TData>[];
  /**
   * Override backend column properties by column id.
   * Array of objects with required `id` (backend column id) and any column properties to merge.
   */
  overrideColumns?: Array<{ id: string } & Partial<ColumnDef<TData>>>;
  /** When false, the query is not run. */
  enabled?: boolean;
}

/**
 * Fetches column definitions from the backend and converts them to TanStack ColumnDef.
 * Use with DataTable: columns={columns} while isLoading show a skeleton.
 */
export function useBackendColumns<TData = Record<string, unknown>>(
  options: UseBackendColumnsOptions<TData>
): {
  columns: ColumnDef<TData>[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  columnVisibility: Record<string, boolean>;
} {
  const {
    fetchColumns,
    queryKey,
    prependColumns = [],
    appendColumns = [],
    overrideColumns,
    enabled = true,
  } = options;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await fetchColumns();
      const columns = "columns" in result ? result.columns : (result as BackendColumnsResponse).columns;
      const columnVisibility = "columnVisibility" in result ? result.columnVisibility : columns.map(x => x.id).reduce<Record<string, boolean>>((acc, id) => {
        acc[id] = true;
        return acc;
      }, {});
      return {
        columns: Array.isArray(columns) ? columns : [],
        columnVisibility: columnVisibility,
      };
    },
    enabled,
  });

  const backendColumns = (query.data?.columns ?? []) as BackendColumnDefinition[];
  const converted = React.useMemo(
    () => convertBackendColumns(backendColumns) as ColumnDef<TData>[],
    [backendColumns]
  );

  const overrideById = React.useMemo(() => {
    if (!overrideColumns?.length) return null;
    return overrideColumns.reduce<Record<string, { id: string } & Partial<ColumnDef<TData>>>>(
      (acc, item) => {
        acc[item.id] = item;
        return acc;
      },
      {}
    );
  }, [overrideColumns]);

  const columns = React.useMemo<ColumnDef<TData>[]>(() => {
    const merged: ColumnDef<TData>[] = overrideById
      ? converted.map((col) => {
        const id =
          col.id ??
          (col as { accessorKey?: string }).accessorKey ??
          "";
        const override = id ? overrideById[id] : undefined;
        if (!override) return col;
        const { id: _overrideId, meta: overrideMeta, ...restOverride } = override;
        const mergedMeta = overrideMeta
          ? { ...col.meta, ...overrideMeta }
          : col.meta;
        return {
          ...col,
          ...restOverride,
          meta: mergedMeta,
        } as ColumnDef<TData>;
      })
      : converted;
    return [...prependColumns, ...merged, ...appendColumns];
  }, [prependColumns, converted, appendColumns, overrideById]);

  const columnVisibility = React.useMemo(
    () =>
      (query.data?.columnVisibility ?? EMPTY_COLUMN_VISIBILITY) as Record<
        string,
        boolean
      >,
    [query.data?.columnVisibility]
  );

  return {
    columns,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
    columnVisibility,
  };
}
