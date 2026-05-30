import type { ServerColumnFilter, ServerTableState } from "../types/data-table";
import type { FilterItemSchema } from "./parsers";

/**
 * Serializes ServerTableState into query params the Go datatable ExtractQuery expects.
 */
export function serializeServerTableParams<TData>(
  state: ServerTableState<TData>,
): Record<string, string> {
  const params: Record<string, string> = {
    "pagination[page]": String(state.pagination.page),
    "pagination[perPage]": String(state.pagination.perPage),
  };

  if (state.sorting.length > 0) {
    params.sorting = JSON.stringify(
      state.sorting.map((s) => ({ id: s.id, desc: Boolean(s.desc) })),
    );
  }

  if (state.columnFilters.length > 0) {
    params.columnFilters = JSON.stringify(
      state.columnFilters.map((f) => serializeColumnFilter(f)),
    );
  }

  if (state.filters && state.filters.length > 0) {
    params.filters = JSON.stringify(
      state.filters.map((filter) => serializeAdvancedFilter(filter)),
    );
    params.filterFlag = "advancedFilters";
    if (state.joinOperator) {
      params.joinOperator = state.joinOperator;
    }
  }

  return params;
}

function serializeAdvancedFilter(
  filter: FilterItemSchema,
): Record<string, unknown> {
  const item: Record<string, unknown> = {
    id: filter.id,
    variant: filter.variant,
    operator: filter.operator,
    filterId: filter.filterId,
  };

  if (filter.operator === "isEmpty" || filter.operator === "isNotEmpty") {
    return item;
  }

  const value = filter.value;
  if (Array.isArray(value)) {
    item.values = value.map(String);
  } else if (value != null && value !== "") {
    item.value = String(value);
  }

  return item;
}

function serializeColumnFilter(filter: ServerColumnFilter): Record<string, unknown> {
  const item: Record<string, unknown> = { id: filter.id };
  if (Array.isArray(filter.value)) {
    item.values = filter.value.map(String);
  } else if (filter.value != null && filter.value !== "") {
    item.value = String(filter.value);
  }
  if (filter.variant) {
    item.variant = filter.variant;
  }

  const operator = defaultColumnFilterOperator(filter);
  if (operator) {
    item.operator = operator;
  }

  return item;
}

function defaultColumnFilterOperator(
  filter: ServerColumnFilter,
): string | undefined {
  switch (filter.variant) {
    case "text":
      return "iLike";
    case "multiSelect":
    case "select":
      return "inArray";
    default:
      return undefined;
  }
}
