import { useQueryState } from "nuqs";
import { Check, CommandIcon, Ellipsis, FileSpreadsheetIcon, X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { useCallback } from "react";



export type FlagConfig = typeof flagConfig;

export const flagConfig = [
  {
    label: "Advanced filters",
    value: "advancedFilters" as const,
    icon: FileSpreadsheetIcon,
  },
  {
    label: "Command filters",
    value: "commandFilters" as const,
    icon: CommandIcon,
  },
]


type FilterFlag = "advancedFilters" | "commandFilters"

export function useTableAdvancedOptions() {
  const [filterFlag, setFilterFlag] = useQueryState<FilterFlag | null>(
    "filterFlag",
    {
      parse: (value) => {
        if (!value) return null;
        const validValues = flagConfig.map((flag) => flag.value);
        return validValues.includes(value as FilterFlag)
          ? (value as FilterFlag)
          : null;
      },
      serialize: (value) => value ?? "",
      defaultValue: null,
      clearOnDefault: true,
      shallow: false,
      eq: (a, b) => (!a && !b) || a === b,
    },
  );

  const onFilterFlagChange = useCallback(
    (value: FilterFlag) => {
      setFilterFlag(value);
    },
    [setFilterFlag],
  );



  function onChange(value: FilterFlag | null) {
    if (value === null) {
      setFilterFlag(null);
    } else {
      onFilterFlagChange(value);
    }
  }
  return {
    enableAdvancedFilter: filterFlag === "advancedFilters" || filterFlag === "commandFilters",
    filterFlag,
    onChange
  }
}

export function DataTableAdvancedOptions() {
  const [filterFlag, setFilterFlag] = useQueryState<FilterFlag | null>(
    "filterFlag",
    {
      parse: (value) => {
        if (!value) return null;
        const validValues = flagConfig.map((flag) => flag.value);
        return validValues.includes(value as FilterFlag)
          ? (value as FilterFlag)
          : null;
      },
      serialize: (value) => value ?? "",
      defaultValue: null,
      clearOnDefault: true,
      shallow: false,
      eq: (a, b) => (!a && !b) || a === b,
    },
  );

  const onFilterFlagChange = useCallback(
    (value: FilterFlag) => {
      setFilterFlag(value);
    },
    [setFilterFlag],
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open menu"
            variant="outline"
            className="flex size-8 p-0 data-[state=open]:bg-muted"
          >
            {filterFlag=="advancedFilters" && <FileSpreadsheetIcon className="size-4" />}
            {filterFlag=="commandFilters" && <CommandIcon className="size-4" />}
            {filterFlag == null && <Ellipsis className="size-4" aria-hidden="true" />}
            
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {flagConfig.map((flag, i) => (
            <DropdownMenuItem
              key={i}
              onSelect={() => onFilterFlagChange(flag.value)}
            >
              {flag.label} {filterFlag === flag.value && <Check />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setFilterFlag(null)}
          >
            Simple Filters
            <DropdownMenuShortcut><X/></DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
