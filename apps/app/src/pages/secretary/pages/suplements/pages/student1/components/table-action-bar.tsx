import type { Table } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { useCallback, useState, useTransition } from "react";

import {
    DataTableActionBar,
    DataTableActionBarAction,
    DataTableActionBarSelection,
} from "@workspace/flowtrove/components/datatable/components/data-table-action-bar";
import ButtonDialog from "@workspace/ui/components/dialog-button";
import { Separator } from "@workspace/ui/components/separator";

import type { Student } from "../api";
import DownloadMultipleSupplements from "../../students/components/download-multiple-supplements";

const actions = ["export"] as const;
type Action = (typeof actions)[number];

interface StudentsTableActionBarProps {
    table: Table<Student>;
    templates: { id: string; name: string }[];
}

export function StudentsTableActionBar({ table, templates }: StudentsTableActionBarProps) {
    const rows = table.getFilteredSelectedRowModel().rows;
    const [isPending, startTransition] = useTransition();
    const [currentAction, setCurrentAction] = useState<Action | null>(null);

    const getIsActionPending = useCallback(
        (action: Action) => isPending && currentAction === action,
        [isPending, currentAction]
    );

    const onTaskExport = useCallback(() => {
        setCurrentAction("export");
        startTransition(() => undefined);
    }, []);

    return (
        <DataTableActionBar table={table} visible={rows.length > 0}>
            <DataTableActionBarSelection table={table} />
            <Separator
                orientation="vertical"
                className="hidden data-[orientation=vertical]:h-5 sm:block"
            />
            <div className="flex items-center gap-1.5">
                <ButtonDialog
                    triggerButton={
                        <DownloadMultipleSupplements
                            students={table.getFilteredSelectedRowModel().rows}
                            templates={templates}
                        />
                    }
                >
                    <DataTableActionBarAction
                        size="icon"
                        tooltip="Shkarko suplementet"
                        isPending={getIsActionPending("export")}
                        onClick={onTaskExport}
                    >
                        <Download />
                    </DataTableActionBarAction>
                </ButtonDialog>
            </div>
        </DataTableActionBar>
    );
}
