import { Search, UserPlus } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type { FC } from "react";
import { QUERY_KEYS } from "@workspace/flowtrove/components/data-table/lib/constants";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import useStudentsListStore from "../store";
import TableConfigCustomizator from "./table-config-customizator";

const StudentsListHeaderActions: FC = () => {
    const openCreateStudent = useStudentsListStore((s) => s.openCreateStudent);
    const [search, setSearch] = useQueryState(
        "full_name",
        parseAsString.withDefault("").withOptions({ throttleMs: 300 }),
    );
    const [, setPage] = useQueryState(QUERY_KEYS.PAGE, parseAsInteger);

    return (
        <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <div className="relative min-w-0 w-full sm:max-w-xs md:max-w-sm lg:max-w-md">
                <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                />
                <Input
                    type="search"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => {
                        const value = e.target.value;
                        void setSearch(value || null);
                        void setPage(1);
                    }}
                    className="h-9 w-full pl-9"
                    aria-label="Search students"
                />
            </div>
            <div className="flex shrink-0 items-center justify-end gap-1">
                <Button type="button" variant="default" onClick={openCreateStudent}>
                    <UserPlus className="size-4" aria-hidden />
                    Add Student
                </Button>
                <TableConfigCustomizator />
            </div>
        </div>
    );
};

export default StudentsListHeaderActions;
