import { useCallback, useEffect, useMemo, useState, type FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cog, Loader2, Plus, Search } from "lucide-react";
import { useParams } from "react-router";
import { Button } from "@workspace/ui/components/button";
import {
    Collapsible,
    CollapsibleContent,
} from "@workspace/ui/components/collapsible";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { isApiErrorBody } from "@workspace/flowtrove/lib/network";
import { cn } from "@workspace/ui/lib/utils";
import { getAcademicYears } from "../../../academicyears/api";
import { getFaculties } from "../../../faculties/api";
import { useStudentListStore } from "../../store";
import AdvancedSearchFiltersPanel, {
    type AdvancedSearchFilters,
} from "./advanced-search-filters";
import { searchStudents, type Student } from "./api";

const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

const emptyFilters = (): AdvancedSearchFilters => ({
    year: "",
    faculty_slug: "",
    level_slug: "",
});

const AddStudentDialog: FC = () => {
    const { year: routeYear = "", faculty_slug: routeFaculty = "", level: routeLevel = "" } =
        useParams();
    const { isAddStudentDialogOpen, setIsAddStudentDialogOpen } = useStudentListStore();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selected, setSelected] = useState<Student[]>([]);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [filters, setFilters] = useState<AdvancedSearchFilters>(emptyFilters);
    const [filtersTouched, setFiltersTouched] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (!isAddStudentDialogOpen) return;
        setFilters({
            year: routeYear,
            faculty_slug: routeFaculty,
            level_slug: routeLevel,
        });
        setFiltersTouched(false);
    }, [isAddStudentDialogOpen, routeYear, routeFaculty, routeLevel]);

    const hasAdvancedFilters = Boolean(
        filters.year || filters.faculty_slug || filters.level_slug,
    );
    const hasTextSearch = debouncedSearch.length >= MIN_SEARCH_LENGTH;
    const canSearch =
        hasTextSearch || (filtersTouched && hasAdvancedFilters);

    const handleAdvancedSearch = useCallback((next: AdvancedSearchFilters) => {
        setFilters(next);
        setFiltersTouched(true);
    }, []);

    const { data: yearsData } = useQuery({
        queryKey: ["scandocuments-academic-years"],
        queryFn: () => getAcademicYears({}),
        enabled: isAddStudentDialogOpen,
    });

    const { data: facultiesData } = useQuery({
        queryKey: ["scandocuments-faculties"],
        queryFn: () => getFaculties({}),
        enabled: isAddStudentDialogOpen,
    });

    const academicYears = yearsData?.academic_years ?? [];
    const faculties = facultiesData?.faculties ?? [];

    const searchParams = useMemo(
        () => ({
            query: debouncedSearch,
            ...(filters.year ? { year: filters.year } : {}),
            ...(filters.faculty_slug ? { faculty_slug: filters.faculty_slug } : {}),
            ...(filters.level_slug ? { level_slug: filters.level_slug } : {}),
        }),
        [debouncedSearch, filters],
    );

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["scandocuments-students-search", searchParams],
        queryFn: () => searchStudents(searchParams),
        enabled: isAddStudentDialogOpen && canSearch,
    });

    const results: Student[] = Array.isArray(data) && !isApiErrorBody(data) ? data : [];
    const selectedIds = new Set(selected.map((s) => s.id));

    const resetState = useCallback(() => {
        setSearch("");
        setDebouncedSearch("");
        setSelected([]);
        setAdvancedOpen(false);
        setFilters(emptyFilters());
        setFiltersTouched(false);
    }, []);

    const onClose = useCallback(() => {
        resetState();
        setIsAddStudentDialogOpen(false);
    }, [resetState, setIsAddStudentDialogOpen]);

    const addToSelection = useCallback((student: Student) => {
        setSelected((prev) =>
            prev.some((s) => s.id === student.id) ? prev : [...prev, student],
        );
    }, []);

    const addToList = useCallback(() => {
        console.log("Students to add:", selected);
        onClose();
    }, [selected, onClose]);

    const hasSelection = selected.length > 0;

    const emptyMessage = !canSearch
        ? `Type at least ${MIN_SEARCH_LENGTH} characters, or set advanced filters and click Search.`
        : isLoading || isFetching
            ? null
            : results.length === 0
                ? debouncedSearch
                    ? `No students found for "${debouncedSearch}".`
                    : "No students match the selected filters."
                : null;

    return (
        <Dialog open={isAddStudentDialogOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="flex h-[min(88vh,760px)] w-[min(96vw,960px)] max-w-[960px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[960px]">
                <div className="shrink-0 border-b px-5 py-3.5">
                    <DialogHeader className="gap-1 text-left sm:text-left">
                        <DialogTitle className="text-base font-semibold leading-tight">
                            Add students to folder
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs leading-snug">
                            Search the registry and select students to add.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-4 py-2">
                    <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                        <div className="flex shrink-0 items-center gap-2">
                            <Button
                                type="button"
                                size="icon"
                                variant={advancedOpen ? "default" : "outline"}
                                className="size-8 shrink-0"
                                aria-label="Advanced search filters"
                                aria-expanded={advancedOpen}
                                onClick={() => setAdvancedOpen((open) => !open)}
                            >
                                <Cog className="size-4" aria-hidden />
                            </Button>
                            <div className="relative min-w-0 flex-1">
                                <Search
                                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                                    aria-hidden
                                />
                                <Input
                                    type="search"
                                    placeholder="Search by name, email, or ID…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-8 pl-9 text-sm"
                                    autoFocus
                                    aria-label="Search students"
                                />
                            </div>
                        </div>
                        <CollapsibleContent className="pt-1.5">
                            <AdvancedSearchFiltersPanel
                                filters={filters}
                                onSearch={handleAdvancedSearch}
                                academicYears={academicYears}
                                faculties={faculties}
                            />
                        </CollapsibleContent>
                    </Collapsible>

                    {hasSelection ? (
                        <div className="shrink-0 space-y-1">
                            <p className="text-muted-foreground text-[11px] font-medium">
                                Selected ({selected.length})
                            </p>
                            <ul className="flex max-h-9 flex-wrap gap-1 overflow-y-auto">
                                {selected.map((student) => (
                                    <li
                                        key={student.id}
                                        className="rounded-md border bg-muted/40 px-2 py-0.5 text-xs font-medium"
                                    >
                                        {student.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border">
                        {emptyMessage ? (
                            <p className="text-muted-foreground px-4 py-6 text-center text-sm">
                                {emptyMessage}
                            </p>
                        ) : isLoading || isFetching ? (
                            <div className="flex items-center justify-center gap-2 px-4 py-6 text-muted-foreground">
                                <Loader2 className="size-4 animate-spin" aria-hidden />
                                <span className="text-sm">Searching…</span>
                            </div>
                        ) : (
                            <ul className="divide-y">
                                {results.map((student) => {
                                    const isSelected = selectedIds.has(student.id);
                                    return (
                                        <li
                                            key={student.id}
                                            className={cn(
                                                "flex items-center justify-between gap-2 px-3 py-1.5",
                                                isSelected && "bg-primary/5",
                                            )}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {student.name}
                                                </p>
                                                <p className="text-muted-foreground font-mono text-xs">
                                                    #{student.id}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant={isSelected ? "secondary" : "outline"}
                                                className="size-8 shrink-0"
                                                disabled={isSelected}
                                                aria-label={
                                                    isSelected
                                                        ? `${student.name} already selected`
                                                        : `Add ${student.name}`
                                                }
                                                onClick={() => addToSelection(student)}
                                            >
                                                <Plus className="size-4" aria-hidden />
                                            </Button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                <DialogFooter className="shrink-0 gap-2 border-t bg-muted/20 px-4 py-2 sm:justify-end">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    {hasSelection ? (
                        <Button type="button" onClick={addToList}>
                            Add to list
                        </Button>
                    ) : null}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddStudentDialog;
