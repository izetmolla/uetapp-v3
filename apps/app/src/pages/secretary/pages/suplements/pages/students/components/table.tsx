import * as React from "react";

import { DataTable } from "@workspace/flowtrove/components/datatable/data-table";
import { useDataTable } from "@workspace/flowtrove/components/datatable/hooks/use-datatable";

import { DataTableAdvancedToolbar } from "@workspace/flowtrove/components/datatable/data-table-advanced-toolbar";
import { DataTableFilterList } from "@workspace/flowtrove/components/datatable/data-table-filter-list";
import { DataTableFilterMenu } from "@workspace/flowtrove/components/datatable/data-table-filter-menu";
import { DataTableSortList } from "@workspace/flowtrove/components/datatable/data-table-sort-list";
import { DataTableToolbar } from "@workspace/flowtrove/components/datatable/data-table-toolbar";

import { getStudentsTableColumns } from "./table-columns";

// import { DeleteEmployeesDialog } from "./delete-client-dialog";
import { useTableAdvancedOptions } from "@workspace/flowtrove/components/datatable/data-table-advanced-options";
import { StudentsTableActionBar } from "./table-action-bar";
import { useNavigate } from "react-router";
import DownloadContentDialog, { useDownloadDialog } from "./download-content-dialog";
import type { Student } from "../api";

interface StudentsTableProps {
    templates: { id: string; name: string }[];
    io: any[];
    content: {
        students: Student[];
        pageCount: number;
    };
}

export function StudentsTable({ content, io, templates }: StudentsTableProps) {
    const { openstudentsToDownload, setDialogState, setStudentToDownload } = useDownloadDialog();
    const navigate = useNavigate();
    const { enableAdvancedFilter, filterFlag } = useTableAdvancedOptions();
    const {
        students: employees,
        pageCount
    } = content;




    const onActionClicked = (action: string, student: Student) => {
        if (action == "download") {
            setStudentToDownload(student);
            setDialogState(true, [student.id]);
        }
    }

    const columns = React.useMemo(
        () =>
            getStudentsTableColumns({
                navigate: navigate,
                // statusCounts,
                // priorityCounts,
                // estimatedHoursRange,
                io,
                // setRowAction,
                onActionClicked,
            }),
        [io],
    );

    const { table, shallow, debounceMs, throttleMs } = useDataTable({
        data: employees,
        columns,
        pageCount,
        enableAdvancedFilter,
        initialState: {
            sorting: [{ id: "graduated_at", desc: true }],
            columnPinning: { right: ["actions"] },
        },
        getRowId: (originalRow) => originalRow.id,
        shallow: false,
        clearOnDefault: true,
    });

    return (
        <>
            <DataTable
                key={JSON.stringify(io.map(item => ({ id: item.id, reference: item.reference })))}
                table={table}
                actionBar={<StudentsTableActionBar table={table} templates={templates} />}
            >
                {enableAdvancedFilter ? (
                    <DataTableAdvancedToolbar table={table}>
                        <DataTableSortList table={table} align="start" />
                        {filterFlag === "advancedFilters" ? (
                            <DataTableFilterList
                                table={table}
                                shallow={shallow}
                                debounceMs={debounceMs}
                                throttleMs={throttleMs}
                                align="start"
                            />
                        ) : (
                            <DataTableFilterMenu
                                table={table}
                                shallow={shallow}
                                debounceMs={debounceMs}
                                throttleMs={throttleMs}
                            />
                        )}
                    </DataTableAdvancedToolbar>
                ) : (
                    <DataTableToolbar table={table}>
                        <DataTableSortList table={table} align="end" />
                    </DataTableToolbar>
                )}
            </DataTable>
            {openstudentsToDownload && <DownloadContentDialog templates={templates} />}
        </>
    );
}