"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import type { Parser } from "nuqs";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
  useQueryStates,
} from "nuqs";
import * as React from "react";

import { dataTableConfig } from "../config/data-table";
import { ARRAY_SEPARATOR, QUERY_KEYS } from "../lib/constants";
import { getFiltersStateParser, getSortingStateParser } from "../lib/parsers";
import type {
  ExtendedColumnFilter,
  ExtendedColumnSort,
  FilterVariant,
  JoinOperator,
  ServerColumnFilter,
  ServerPaginationMeta,
  ServerTableState,
  UseServerTableDataOptions,
} from "../types/data-table";

type ColumnWithFilter = ColumnDef<unknown> & {
  id?: string;
  enableColumnFilter?: boolean;
  meta?: { options?: unknown[]; variant?: FilterVariant };
};

export function useServerTableData<TData>(
  options: UseServerTableDataOptions<TData> & {
    columns: ColumnDef<TData>[];
  }
) {
  const {
    fetch: queryFn,
    queryKey,
    initialPerPage,
    enableAdvancedFilter = false,
    columns,
    enabled = true,
  } = options;

  const defaultPerPage = initialPerPage  ?? 10;

  const columnIds = React.useMemo(
    () =>
      new Set(columns.map((c) => c.id).filter(Boolean) as string[]),
    [columns]
  );

  const sortParser = React.useMemo(
    () => getSortingStateParser<TData>(columnIds),
    [columnIds]
  );

  const [page] = useQueryState(QUERY_KEYS.PAGE, parseAsInteger.withDefault(1));
  const [perPage] = useQueryState(
    QUERY_KEYS.PER_PAGE,
    parseAsInteger.withDefault(defaultPerPage)
  );
  const [sorting] = useQueryState(QUERY_KEYS.SORT, sortParser.withDefault([]));

  const filterableColumns = React.useMemo(
    () =>
      (columns as ColumnWithFilter[]).filter(
        (c) =>
          c.enableColumnFilter &&
          !(c.meta as { enableOnlyAdvancedFilters?: boolean } | undefined)
            ?.enableOnlyAdvancedFilters
      ),
    [columns]
  );

  const filterParsers = React.useMemo((): Record<string, Parser<string> | Parser<string[]>> => {
    return filterableColumns.reduce<Record<string, Parser<string> | Parser<string[]>>>(
      (acc, column) => {
        const id = column.id ?? "";
        if ((column as ColumnWithFilter).meta?.options) {
          acc[id] = parseAsArrayOf(parseAsString, ARRAY_SEPARATOR);
        } else {
          acc[id] = parseAsString;
        }
        return acc;
      },
      {}
    );
  }, [filterableColumns]);

  const [filterValues, setFilterValues] = useQueryStates(filterParsers);

  const clearColumnFilters = React.useCallback(() => {
    setFilterValues(
      Object.fromEntries(
        Object.keys(filterParsers).map((k) => [k, null])
      ) as Record<string, string | string[] | null>
    );
  }, [filterParsers, setFilterValues]);

  const filtersParser = React.useMemo(
    () => getFiltersStateParser<TData>(columnIds),
    [columnIds]
  );
  const [advancedFilters] = useQueryState(
    QUERY_KEYS.FILTERS,
    filtersParser.withDefault([])
  );
  const [joinOperator] = useQueryState(
    QUERY_KEYS.JOIN_OPERATOR,
    parseAsStringEnum([...dataTableConfig.joinOperators]).withDefault("and")
  );

  const state: ServerTableState<TData> = React.useMemo(() => {
    const columnFilters = enableAdvancedFilter
      ? []
      : Object.entries(filterValues).reduce<ServerColumnFilter[]>(
          (acc, [id, value]) => {
          if (value != null && value !== "") {
            const column = filterableColumns.find(
              (c) => (c.id ?? "") === id
            ) as ColumnWithFilter | undefined;
            acc.push({
              id,
              value: Array.isArray(value) ? value : value,
              ...(column?.meta?.variant != null && {
                variant: column.meta.variant,
              }),
            });
          }
          return acc;
        },
          []
        );

    return {
      pagination: { page, perPage },
      sorting: (sorting ?? []) as ExtendedColumnSort<TData>[],
      columnFilters,
      ...(enableAdvancedFilter && {
        filters: (advancedFilters ?? []) as ExtendedColumnFilter<TData>[],
        joinOperator: joinOperator as JoinOperator | undefined,
      }),
    };
  }, [
    page,
    perPage,
    sorting,
    enableAdvancedFilter,
    filterValues,
    filterableColumns,
    advancedFilters,
    joinOperator,
  ]);

  const resolvedQueryKey =
    typeof queryKey === 'function' ? queryKey(state) : [...queryKey, state];

  const query = useQuery({
    queryKey: resolvedQueryKey,
    queryFn: () => queryFn(state),
    placeholderData: (prev) => prev,
    enabled,
  });

  const data = query.data?.data ?? [];
  const pagination: ServerPaginationMeta = query.data?.pagination ?? {
    pageCount: 0,
    total: 0,
    page,
    perPage,
  };

  return {
    data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    pagination,
    refetch: query.refetch,
    clearColumnFilters,
  };
}
