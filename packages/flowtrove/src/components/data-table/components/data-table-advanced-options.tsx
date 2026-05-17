"use client";

import { useQueryState, parseAsString } from "nuqs";
import { FileSpreadsheetIcon, ListFilter, RotateCcw } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { ToggleGroup, ToggleGroupItem } from "@workspace/ui/components/toggle-group";

import { QUERY_KEYS } from "../lib/constants";

export type FilterMode = "simple" | "advancedFilters";

const SIMPLE_VALUE = "simple";
const ADVANCED_VALUE: FilterMode = "advancedFilters";

const validValues: FilterMode[] = [SIMPLE_VALUE as FilterMode, ADVANCED_VALUE];

export function useTableAdvancedOptions() {
  const [filterFlag, setFilterFlag] = useQueryState<FilterMode | null>(
    "filterFlag",
    {
      parse: (value) => {
        if (!value || value === SIMPLE_VALUE) return null;
        return validValues.includes(value as FilterMode)
          ? (value as FilterMode)
          : null;
      },
      serialize: (value) => (value === ADVANCED_VALUE ? ADVANCED_VALUE : ""),
      defaultValue: null,
      clearOnDefault: true,
      shallow: false,
      eq: (a, b) => (!a && !b) || a === b,
    },
  );

  return {
    enableAdvancedFilter: filterFlag === ADVANCED_VALUE,
    filterFlag,
    setFilterFlag,
  };
}

interface DataTableAdvancedOptionsProps {
  clearColumnFilters?: () => void;
}

function hasActiveAdvancedFilters(rawFilters: string | null | unknown): boolean {
  if (rawFilters == null) return false;
  if (typeof rawFilters === "string") {
    const trimmed = rawFilters.trim();
    if (trimmed === "" || trimmed === "[]") return false;
    return true;
  }
  if (Array.isArray(rawFilters)) return rawFilters.length > 0;
  return false;
}

/** Reset button for advanced filters; visible only when advanced mode is on and any filter is applied. Render after the Filter button in the toolbar. Clears filters, join operator, and sortings. */
export function DataTableAdvancedResetButton() {
  const { filterFlag } = useTableAdvancedOptions();
  const [rawFilters, setFilters] = useQueryState(
    QUERY_KEYS.FILTERS,
    parseAsString
  );
  const [, setJoinOperator] = useQueryState(
    QUERY_KEYS.JOIN_OPERATOR,
    parseAsString
  );
  const [, setSorting] = useQueryState(QUERY_KEYS.SORT, parseAsString);

  const showReset =
    filterFlag === ADVANCED_VALUE && hasActiveAdvancedFilters(rawFilters ?? null);

  const handleResetFilters = () => {
    setFilters(null);
    setJoinOperator(null);
    setSorting(null);
  };

  if (!showReset) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 gap-1.5"
      onClick={handleResetFilters}
      aria-label="Reset advanced filters"
    >
      <RotateCcw className="size-3.5" />
      Reset
    </Button>
  );
}

export function DataTableAdvancedOptions({
  clearColumnFilters,
}: DataTableAdvancedOptionsProps = {}) {
  const { filterFlag, setFilterFlag } = useTableAdvancedOptions();
  const [, setFilters] = useQueryState(QUERY_KEYS.FILTERS, parseAsString);
  const [, setJoinOperator] = useQueryState(
    QUERY_KEYS.JOIN_OPERATOR,
    parseAsString
  );

  const currentValue =
    filterFlag === ADVANCED_VALUE ? ADVANCED_VALUE : SIMPLE_VALUE;

  const handleModeChange = (value: string | null) => {
    if (value === SIMPLE_VALUE) {
      setFilters(null);
      setJoinOperator(null);
      setFilterFlag(null);
    } else if (value === ADVANCED_VALUE) {
      clearColumnFilters?.();
      setFilterFlag(ADVANCED_VALUE);
    }
  };

  return (
    <ToggleGroup
      type="single"
      value={currentValue}
      onValueChange={(value) => {
        if (value) {
          handleModeChange(value);
        }
      }}
      variant="outline"
      size="sm"
      className="h-8"
    >
      <ToggleGroupItem
        value={SIMPLE_VALUE}
        aria-label="Simple filters"
        className="size-8 p-0"
      >
        <ListFilter className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value={ADVANCED_VALUE}
        aria-label="Advanced filters"
        className="size-8 p-0"
      >
        <FileSpreadsheetIcon className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
