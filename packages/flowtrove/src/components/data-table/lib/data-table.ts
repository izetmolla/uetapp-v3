import type {
    ExtendedColumnFilter,
    FilterOperator,
    FilterVariant,
} from "../types/data-table";
import type { Column } from "@tanstack/react-table";

import { dataTableConfig } from "../config/data-table";

export function getCommonPinningStyles<TData>({
    column,
    withBorder = false,
    layer = "body",
}: {
    column: Column<TData>;
    withBorder?: boolean;
    /** Header cells need a higher z-index than body cells when using sticky headers. */
    layer?: "header" | "body";
}): React.CSSProperties {
    const isPinned = column.getIsPinned();
    const isLastLeftPinnedColumn =
        isPinned === "left" && column.getIsLastColumn("left");
    const isFirstRightPinnedColumn =
        isPinned === "right" && column.getIsFirstColumn("right");

    const zIndex = !isPinned
        ? 0
        : layer === "header"
          ? 30
          : column.id === "actions"
            ? 25
            : 15;

    return {
        boxShadow: withBorder
            ? isLastLeftPinnedColumn
                ? "-4px 0 4px -4px hsl(var(--border)) inset"
                : isFirstRightPinnedColumn
                    ? "4px 0 4px -4px hsl(var(--border)) inset"
                    : undefined
            : undefined,
        left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
        right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
        opacity: isPinned ? 0.97 : 1,
        position: isPinned ? "sticky" : "relative",
        background: isPinned
            ? "hsl(var(--background) / 0.85)"
            : "hsl(var(--background))",
        backdropFilter: isPinned ? "blur(8px)" : undefined,
        WebkitBackdropFilter: isPinned ? "blur(8px)" : undefined,
        width: column.getSize(),
        zIndex,
    };
}

export function getFilterOperators(filterVariant: FilterVariant) {
    const operatorMap: Record<
        FilterVariant,
        { label: string; value: FilterOperator }[]
    > = {
        text: dataTableConfig.textOperators,
        number: dataTableConfig.numericOperators,
        range: dataTableConfig.numericOperators,
        date: dataTableConfig.dateOperators,
        dateRange: dataTableConfig.dateOperators,
        boolean: dataTableConfig.booleanOperators,
        select: dataTableConfig.selectOperators,
        multiSelect: dataTableConfig.multiSelectOperators,
    };

    return operatorMap[filterVariant] ?? dataTableConfig.textOperators;
}

export function getDefaultFilterOperator(filterVariant: FilterVariant) {
    const operators = getFilterOperators(filterVariant);

    return operators[0]?.value ?? (filterVariant === "text" ? "iLike" : "eq");
}

export function getValidFilters<TData>(
    filters: ExtendedColumnFilter<TData>[],
): ExtendedColumnFilter<TData>[] {
    return filters.filter(
        (filter) =>
            filter.operator === "isEmpty" ||
            filter.operator === "isNotEmpty" ||
            (Array.isArray(filter.value)
                ? filter.value.length > 0
                : filter.value !== "" &&
                filter.value !== null &&
                filter.value !== undefined),
    );
}
