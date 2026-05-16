import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { getSingleEntityGeneral, type GetSingleEntityGeneralResponse } from "./api";
import { withError, withInitialData } from "@workspace/flowtrove/lib/network";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { FILTER_OPERATORS, hasPendingChanges, selectedRowCount, useDatabaseStore, type Filter, type Row } from "../store";
import { Button } from "@workspace/ui/components/button";
import { Plus, ChevronLeft, ChevronRight, RefreshCw, MoreHorizontal, X, ArrowUp, ArrowDown, FilterIcon, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { ArrowUpDown } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { EntityDetailSectionNav } from "../../components/entity-detail-section-nav";

const EntitiesSinglePageGeneral = () => {

    const { t } = useTranslation();
    const { ws, entity_id } = useParams();
    const { data, isLoading, error } = useQuery({
        queryKey: ['entities', ws, entity_id],
        queryFn: () => getSingleEntityGeneral({ ws, entity_id }),
        ...withInitialData<GetSingleEntityGeneralResponse>()
    })
    const columns = useMemo(() => data?.attributes || [], [data]);
    const records = useMemo(() => data?.records?.data || [], [data]);


    const {
        // columns,
        pendingRows,
        page,
        pageSize,
        selectedRows,
        filters,
        sorts,
        addRow,
        updateCell,
        removeRow,
        saveRows,
        discardRows,
        setPage,
        setPageSize,
        toggleRowSelection,
        clearRowSelection,
        cycleSort,
        addFilter,
        updateFilter,
        removeFilter,
        clearFilters,
    } = useDatabaseStore();
    const dirty = useDatabaseStore(hasPendingChanges);
    const selectedCount = useDatabaseStore(selectedRowCount);

    const visibleRows = useMemo(() => {
        let arr = pendingRows.map((r, i) => ({ row: r, idx: i }));
        // filters
        for (const f of filters) {
            if (!f.value && f.operator !== "is") continue;
            arr = arr.filter(({ row }) => matchFilter(row[f.column], f.operator, f.value));
        }
        // sort
        if (sorts.length) {
            arr = [...arr].sort((a, b) => {
                for (const s of sorts) {
                    const av = a.row[s.column];
                    const bv = b.row[s.column];
                    const cmp = compare(av, bv);
                    if (cmp !== 0) return s.direction === "asc" ? cmp : -cmp;
                }
                return 0;
            });
        }
        return arr;
    }, [pendingRows, filters, sorts]);

    const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize));
    const pageRows = visibleRows.slice(page * pageSize, page * pageSize + pageSize);

    const deleteSelected = () => {
        const indices = Object.keys(selectedRows).map(Number).sort((a, b) => b - a);
        indices.forEach((i) => removeRow(i));
        clearRowSelection();
    };




    return (
        <ContentLoader
            title={data?.entity?.name ?? t("Entity")}
            description={t("Define columns, constraints, and policies for this entity.")}
            breadcrumb={[{ label: t("Entities"), to: `/workspace/${ws}/entities` }]}
            showHeaderSeparator
            isLoading={isLoading}
            error={withError(error, data)}
        >
            <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-4 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
                        <EntityDetailSectionNav />
                        <div
                            className="hidden h-7 w-px shrink-0 bg-border/80 sm:block"
                            aria-hidden
                        />
                        {/* Filter */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className={cn(
                                        "h-8 gap-1.5",
                                        filters.length > 0 && "border-primary/50 text-primary",
                                    )}
                                >
                                    <FilterIcon className="h-3.5 w-3.5" />
                                    Filter
                                    {filters.length > 0 && (
                                        <span className="ml-0.5 rounded bg-primary/15 px-1.5 text-[10px] font-medium tabular-nums">
                                            {filters.length}
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-[640px] p-0">
                                <FilterPanel
                                    filters={filters}
                                    columns={columns.map((c) => c.name)}
                                    onAdd={addFilter}
                                    onUpdate={updateFilter}
                                    onRemove={removeFilter}
                                    onClear={clearFilters}
                                />
                            </PopoverContent>
                        </Popover>

                        <Button
                            size="sm"
                            onClick={addRow}
                            className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90"
                        >
                            <Plus className="h-4 w-4" />
                            Add record
                        </Button>
                        <Button
                            size="sm"
                            onClick={saveRows}
                            disabled={!dirty}
                            className="h-8 bg-emerald-500 text-emerald-950 hover:bg-emerald-400 disabled:opacity-50"
                        >
                            Save changes
                        </Button>
                        <button
                            onClick={discardRows}
                            disabled={!dirty}
                            className="text-sm text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50 px-2"
                        >
                            Discard changes
                        </button>
                        {selectedCount > 0 && (
                            <>
                                <div className="h-5 w-px bg-border mx-1" />
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    {selectedCount} selected
                                </span>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={deleteSelected}
                                    className="h-8 gap-1.5"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                            {visibleRows.length} rows{" "}
                            <span className="text-muted-foreground/60">• 117ms</span>
                        </span>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                            <SelectTrigger className="h-7 w-[64px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 25, 50, 100].map((n) => (
                                    <SelectItem key={n} value={String(n)}>
                                        {n}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="px-2 tabular-nums">{page}</span>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                            disabled={page >= totalPages - 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-auto">
                    <table className="w-full font-mono text-xs">
                        <thead>
                            <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                                <th className="w-10 px-2 py-2 text-left" />
                                {columns.map((c) => {
                                    const sort = sorts.find((s) => s.column === c.name);
                                    return (
                                        <th
                                            key={c.id}
                                            className="min-w-[160px] px-3 py-2 text-left font-medium"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span>
                                                    <span className="text-foreground">{c.name}</span>{" "}
                                                    <span className="text-[10px] text-muted-foreground/70">
                                                        {c?.dataType?.toLowerCase()}
                                                    </span>
                                                </span>
                                                <button
                                                    onClick={() => cycleSort(c.name)}
                                                    className={cn(
                                                        "rounded p-1 hover:bg-muted transition",
                                                        sort && "text-primary",
                                                    )}
                                                    aria-label="Sort"
                                                >
                                                    {sort?.direction === "asc" ? (
                                                        <ArrowUp className="h-3 w-3" />
                                                    ) : sort?.direction === "desc" ? (
                                                        <ArrowDown className="h-3 w-3" />
                                                    ) : (
                                                        <ArrowUpDown className="h-3 w-3 opacity-50" />
                                                    )}
                                                </button>
                                            </div>
                                        </th>
                                    );
                                })}
                                <th className="w-10 px-2 py-2">
                                    <Plus className="h-4 w-4 text-muted-foreground" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((row, i) => {
                                const checked = !!selectedRows[i];
                                return (
                                    <tr
                                        key={i}
                                        className={cn(
                                            "border-b border-border hover:bg-muted/20 group",
                                            checked && "bg-primary/5",
                                        )}
                                    >
                                        <td className="px-3 py-1.5 align-middle">
                                            <div
                                                className={cn(
                                                    "transition-opacity",
                                                    checked ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                                                )}
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={() => toggleRowSelection(i)}
                                                    aria-label="Select row"
                                                />
                                            </div>
                                        </td>
                                        {columns.map((c) => (
                                            <Cell
                                                key={c.id}
                                                value={row[c.name]}
                                                type={c.dataType}
                                                onChange={(v) => updateCell(i, c.name, v)}
                                            />
                                        ))}
                                        <td />
                                    </tr>
                                )
                            })}
                            {pageRows.map(({ row, idx }) => {
                                const checked = !!selectedRows[idx];
                                return (
                                    <tr
                                        key={idx}
                                        className={cn(
                                            "border-b border-border hover:bg-muted/20 group",
                                            checked && "bg-primary/5",
                                        )}
                                    >
                                        <td className="px-3 py-1.5 align-middle">
                                            <div
                                                className={cn(
                                                    "transition-opacity",
                                                    checked ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                                                )}
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={() => toggleRowSelection(idx)}
                                                    aria-label="Select row"
                                                />
                                            </div>
                                        </td>
                                        {columns.map((c) => (
                                            <Cell
                                                key={c.id}
                                                value={row[c.name]}
                                                type={c.dataType}
                                                onChange={(v) => updateCell(idx, c.name, v)}
                                            />
                                        ))}
                                        <td />
                                    </tr>
                                );
                            })}
                            {pageRows.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={columns.length + 2}
                                        className="text-center py-12 text-sm text-muted-foreground"
                                    >
                                        {filters.length
                                            ? "No rows match the current filters."
                                            : 'No rows. Click "Add record" to insert one.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ContentLoader>
    );
}

export default EntitiesSinglePageGeneral;

function Cell({
    value,
    type,
    onChange,
}: {
    value: string | boolean | null;
    type: string;
    onChange: (v: string | boolean | null) => void;
}) {
    const isNull = value === null || value === undefined;
    const isBool = type === "BOOLEAN";

    return (
        <td className="px-0 py-0 align-middle border-l border-border/50">
            {isBool ? (
                <Select
                    value={isNull ? "null" : value ? "true" : "false"}
                    onValueChange={(v) => onChange(v === "null" ? null : v === "true")}
                >
                    <SelectTrigger className="h-8 w-full rounded-none border-0 bg-transparent font-mono text-xs focus:ring-1 focus:ring-ring focus:ring-inset">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="true">TRUE</SelectItem>
                        <SelectItem value="false">FALSE</SelectItem>
                        <SelectItem value="null">NULL</SelectItem>
                    </SelectContent>
                </Select>
            ) : (
                <Input
                    value={isNull ? "" : String(value)}
                    onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
                    placeholder="NULL"
                    className={cn(
                        "h-8 w-full rounded-none border-0 bg-transparent font-mono text-xs px-3 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset",
                        isNull && "text-muted-foreground/60 placeholder:text-muted-foreground/60",
                    )}
                />
            )}
        </td>
    );
}

function FilterPanel({
    filters,
    columns,
    onAdd,
    onUpdate,
    onRemove,
    onClear,
}: {
    filters: Filter[];
    columns: string[];
    onAdd: () => void;
    onUpdate: (id: string, patch: Partial<Filter>) => void;
    onRemove: (id: string) => void;
    onClear: () => void;
}) {
    return (
        <div className="font-mono text-xs">
            <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Filters
                </span>
                <button
                    onClick={onClear}
                    disabled={filters.length === 0}
                    className="text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-40"
                >
                    Clear filters
                </button>
            </div>
            <div className="p-3 space-y-2 max-h-[320px] overflow-auto">
                {filters.length === 0 && (
                    <div className="text-muted-foreground text-[11px] py-4 text-center">
                        No filters applied to this view.
                    </div>
                )}
                {filters.map((f, i) => (
                    <div key={f.id} className="flex items-center gap-1.5">
                        <button
                            onClick={() => onRemove(f.id)}
                            className="text-muted-foreground hover:text-destructive p-1"
                            aria-label="Remove filter"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-12 text-[10px] uppercase tracking-wider text-muted-foreground">
                            {i === 0 ? "where" : "and"}
                        </span>
                        <Select value={f.column} onValueChange={(v) => onUpdate(f.id, { column: v })}>
                            <SelectTrigger className="h-7 w-[140px] text-xs font-mono">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {columns.map((c) => (
                                    <SelectItem key={c} value={c} className="font-mono text-xs">
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={f.operator}
                            onValueChange={(v) => onUpdate(f.id, { operator: v as typeof f.operator })}
                        >
                            <SelectTrigger className="h-7 w-[170px] text-xs font-mono">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {FILTER_OPERATORS.map((op) => (
                                    <SelectItem key={op.value} value={op.value} className="font-mono text-xs">
                                        {op.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            value={f.value}
                            onChange={(e) => onUpdate(f.id, { value: e.target.value })}
                            placeholder="value"
                            className="h-7 flex-1 font-mono text-xs"
                        />
                    </div>
                ))}
            </div>
            <div className="px-3 py-2 border-t border-border">
                <button
                    onClick={onAdd}
                    className="flex items-center gap-1.5 text-[11px] text-foreground hover:text-primary transition"
                >
                    <Plus className="h-3.5 w-3.5" /> Add filter
                </button>
            </div>
        </div>
    );
}

function compare(a: string | boolean | null, b: string | boolean | null) {
    if (a === b) return 0;
    if (a === null || a === undefined) return -1;
    if (b === null || b === undefined) return 1;
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b), undefined, { numeric: true });
}

function matchFilter(cell: Row[string], op: string, value: string): boolean {
    const c = cell === null || cell === undefined ? "" : String(cell);
    switch (op) {
        case "=":
            return c === value;
        case "<>":
            return c !== value;
        case ">":
            return c > value;
        case "<":
            return c < value;
        case ">=":
            return c >= value;
        case "<=":
            return c <= value;
        case "~~":
            return new RegExp("^" + value.replace(/%/g, ".*").replace(/_/g, ".") + "$").test(c);
        case "~~*":
            return new RegExp(
                "^" + value.replace(/%/g, ".*").replace(/_/g, ".") + "$",
                "i",
            ).test(c);
        case "in":
            return value.split(",").map((s) => s.trim()).includes(c);
        case "is": {
            const v = value.trim().toLowerCase();
            if (v === "null") return cell === null || cell === undefined;
            if (v === "not null") return !(cell === null || cell === undefined);
            if (v === "true") return cell === true || c === "true";
            if (v === "false") return cell === false || c === "false";
            return false;
        }
        default:
            return true;
    }
}