import type { Table } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { Separator } from "@workspace/ui/components/separator";
import type { AcademicYear } from "../api";
import {
    DataTableActionBar,
    DataTableActionBarAction,
    DataTableActionBarSelection,
} from "@workspace/flowtrove/components/data-table/components/data-table-action-bar";

export function AcademicYearsTableActionBar({ table }: { table: Table<AcademicYear> }) {
    return (
        <DataTableActionBar table={table} visible={table.getFilteredSelectedRowModel().rows.length > 0}>
            <DataTableActionBarSelection table={table} />
            <Separator orientation="vertical" className="hidden h-5 sm:block" />
            <DataTableActionBarAction size="icon" tooltip="Export">
                <Download />
            </DataTableActionBarAction>
        </DataTableActionBar>
    );
}
