"use client";

import type { Column, Table } from "@tanstack/react-table";
import { useQueryState, parseAsString } from "nuqs";
import { X } from "lucide-react";
import * as React from "react";

import { DataTableDateFilter } from "./data-table-date-filter";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableSliderFilter } from "./data-table-slider-filter";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { QUERY_KEYS } from "../lib/constants";
import { hasValidFilterVariant } from "../lib/filter-variants";
import { DataTableAdvancedOptions } from "./data-table-advanced-options";

interface DataTableToolbarProps<TData> extends React.ComponentProps<"div"> {
  withoutAdvancedOptions?: boolean;
  table: Table<TData>;
  clearColumnFilters?: () => void;
}

export function DataTableToolbar<TData>({
  table,
  children,
  className,
  withoutAdvancedOptions,
  clearColumnFilters,
  ...props
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [, setSorting] = useQueryState(QUERY_KEYS.SORT, parseAsString);

  const columns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            column.getCanFilter() &&
            hasValidFilterVariant(column.columnDef.meta?.variant) &&
            !column.columnDef.meta?.enableOnlyAdvancedFilters &&
            !column.columnDef.meta?.hidden,
        ),
    [table],
  );

  const onReset = React.useCallback(() => {
    clearColumnFilters?.();
    table.resetColumnFilters();
    setSorting(null);
  }, [table, clearColumnFilters, setSorting]);

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn(
        "flex w-full items-start justify-between gap-2 p-1",
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {columns.map((column) => (
          <DataTableToolbarFilter key={column.id} column={column} />
        ))}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="outline"
            size="sm"
            className="border-dashed"
            onClick={onReset}
          >
            <X />
            Reset
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {!withoutAdvancedOptions && (
          <DataTableAdvancedOptions clearColumnFilters={clearColumnFilters} />
        )}
      </div>
    </div>
  );
}
interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>;
}

function DataTableToolbarFilter<TData>({
  column,
}: DataTableToolbarFilterProps<TData>) {
  {
    const columnMeta = column.columnDef.meta;
    const disabled = columnMeta?.disabled === true;

    const onFilterRender = React.useCallback(() => {
      if (!columnMeta?.variant) return null;

      switch (columnMeta.variant) {
        case "text":
          return (
            <Input
              placeholder={columnMeta.placeholder ?? columnMeta.label}
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(event) => column.setFilterValue(event.target.value)}
              disabled={disabled}
              className="h-8 w-40 lg:w-56"
            />
          );

        case "number":
          return (
            <div className="relative">
              <Input
                type="number"
                inputMode="numeric"
                placeholder={columnMeta.placeholder ?? columnMeta.label}
                value={(column.getFilterValue() as string) ?? ""}
                onChange={(event) => column.setFilterValue(event.target.value)}
                disabled={disabled}
                className={cn("h-8 w-[120px]", columnMeta.unit && "pr-8")}
              />
              {columnMeta.unit && (
                <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
                  {columnMeta.unit}
                </span>
              )}
            </div>
          );

        case "range":
          return (
            <DataTableSliderFilter
              column={column}
              title={columnMeta.label ?? column.id}
              disabled={disabled}
            />
          );

        case "date":
        case "dateRange":
          return (
            <DataTableDateFilter
              column={column}
              title={columnMeta.label ?? column.id}
              multiple={columnMeta.variant === "dateRange"}
              disabled={disabled}
            />
          );

        case "select":
        case "multiSelect":
          return (
            <DataTableFacetedFilter
              column={column}
              title={columnMeta.label ?? column.id}
              options={columnMeta.options ?? []}
              multiple={columnMeta.variant === "multiSelect"}
              disabled={disabled}
            />
          );

        default:
          return null;
      }
    }, [column, columnMeta, disabled]);

    return onFilterRender();
  }
}
