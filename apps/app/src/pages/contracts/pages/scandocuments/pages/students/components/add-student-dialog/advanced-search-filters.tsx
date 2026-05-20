import { useCallback, useEffect, useMemo, useState, type FC, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { ReactSelectAsync } from "@workspace/ui/components/reactselectasync";
import type { AcademicYear } from "../../../academicyears/api";
import type { Faculty } from "../../../faculties/api";
import { getStudyLevels } from "../../../studylevels/api";

export type AdvancedSearchFilters = {
    year: string;
    faculty_slug: string;
    level_slug: string;
};

type SelectOption = { label: string; value: string };

type AdvancedSearchFiltersProps = {
    filters: AdvancedSearchFilters;
    onSearch: (filters: AdvancedSearchFilters) => void;
    academicYears: AcademicYear[];
    faculties: Faculty[];
};

const menuPortalTarget = typeof document !== "undefined" ? document.body : undefined;

function filterOptions(options: SelectOption[], inputValue: string): SelectOption[] {
    const q = inputValue.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
}

function createLoadOptions(options: SelectOption[]) {
    return (inputValue: string, callback: (opts: SelectOption[]) => void) => {
        callback(filterOptions(options, inputValue));
    };
}

function CompactSelect({
    id,
    label,
    children,
}: {
    id: string;
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <Label htmlFor={id} className="text-muted-foreground text-[11px] font-medium leading-none">
                {label}
            </Label>
            {children}
        </div>
    );
}

const AdvancedSearchFiltersPanel: FC<AdvancedSearchFiltersProps> = ({
    filters,
    onSearch,
    academicYears,
    faculties,
}) => {
    const [draft, setDraft] = useState<AdvancedSearchFilters>(filters);

    useEffect(() => {
        setDraft(filters);
    }, [filters]);

    const yearOptions = useMemo<SelectOption[]>(
        () => [
            { label: "All years", value: "" },
            ...academicYears.map((y) => ({
                label: y.year.replace("-", " – "),
                value: y.year,
            })),
        ],
        [academicYears],
    );

    const facultyOptions = useMemo<SelectOption[]>(
        () => [
            { label: "All faculties", value: "" },
            ...faculties.map((f) => ({ label: f.name, value: f.slug })),
        ],
        [faculties],
    );

    const { data: levelsData, isLoading: isStudyLevelsLoading } = useQuery({
        queryKey: ["scandocuments-study-levels-draft", draft.year, draft.faculty_slug],
        queryFn: () =>
            getStudyLevels({
                year: draft.year,
                faculty_slug: draft.faculty_slug,
            }),
        enabled: Boolean(draft.year && draft.faculty_slug),
    });

    const levelOptions = useMemo<SelectOption[]>(
        () => [
            { label: "All levels", value: "" },
            ...(levelsData?.study_levels ?? []).map((l) => ({
                label: l.name,
                value: l.slug,
            })),
        ],
        [levelsData?.study_levels],
    );

    const loadYearOptions = useCallback(createLoadOptions(yearOptions), [yearOptions]);
    const loadFacultyOptions = useCallback(createLoadOptions(facultyOptions), [facultyOptions]);
    const loadLevelOptions = useCallback(createLoadOptions(levelOptions), [levelOptions]);

    const studyLevelDisabled =
        !draft.year || !draft.faculty_slug || isStudyLevelsLoading;

    const selectProps = {
        size: "sm" as const,
        isClearable: true as const,
        menuPortalTarget,
        menuPosition: "fixed" as const,
        menuPlacement: "auto" as const,
        className: "w-full min-w-0",
    };

    return (
        <div className="rounded-lg border bg-muted/40 p-2">
            <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto]">
                <CompactSelect id="adv-year" label="Academic year">
                    <ReactSelectAsync<SelectOption>
                        {...selectProps}
                        inputId="adv-year"
                        placeholder="All years"
                        defaultOptions={yearOptions}
                        loadOptions={loadYearOptions}
                        value={draft.year || null}
                        getOptionValue={(o) => o.value}
                        getOptionLabel={(o) => o.label}
                        onValueChange={(value) =>
                            setDraft((prev) => ({
                                ...prev,
                                year: value ?? "",
                                level_slug: "",
                            }))
                        }
                    />
                </CompactSelect>
                <CompactSelect id="adv-faculty" label="Faculty">
                    <ReactSelectAsync<SelectOption>
                        {...selectProps}
                        inputId="adv-faculty"
                        placeholder="All faculties"
                        defaultOptions={facultyOptions}
                        loadOptions={loadFacultyOptions}
                        value={draft.faculty_slug || null}
                        getOptionValue={(o) => o.value}
                        getOptionLabel={(o) => o.label}
                        onValueChange={(value) =>
                            setDraft((prev) => ({
                                ...prev,
                                faculty_slug: value ?? "",
                                level_slug: "",
                            }))
                        }
                    />
                </CompactSelect>
                <CompactSelect id="adv-level" label="Study level">
                    <ReactSelectAsync<SelectOption>
                        {...selectProps}
                        inputId="adv-level"
                        placeholder={
                            !draft.year || !draft.faculty_slug ? "Year + faculty" : "All levels"
                        }
                        isDisabled={studyLevelDisabled}
                        isLoading={isStudyLevelsLoading}
                        defaultOptions={levelOptions}
                        loadOptions={loadLevelOptions}
                        value={draft.level_slug || null}
                        getOptionValue={(o) => o.value}
                        getOptionLabel={(o) => o.label}
                        onValueChange={(value) =>
                            setDraft((prev) => ({
                                ...prev,
                                level_slug: value ?? "",
                            }))
                        }
                    />
                </CompactSelect>
                <Button
                    type="button"
                    size="sm"
                    className="h-8 w-full shrink-0 gap-1.5 lg:w-auto"
                    onClick={() => onSearch(draft)}
                >
                    <Search className="size-3.5" aria-hidden />
                    Search
                </Button>
            </div>
        </div>
    );
};

export default AdvancedSearchFiltersPanel;
