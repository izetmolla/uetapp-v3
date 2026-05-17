// import { SelectTrigger } from "@radix-ui/react-select";
import type { Table } from "@tanstack/react-table";
import {
    // ArrowUp, CheckCircle2, 
    Download,
    // Mail,

} from "lucide-react";
// import { toast } from "sonner";



import {
    DataTableActionBar,
    DataTableActionBarAction,
    DataTableActionBarSelection,
} from "@workspace/flowtrove/components/datatable/data-table-action-bar";
// import {
//     Select,
//     SelectContent,
//     SelectGroup,
//     SelectItem,
// } from "@/components/ui/select";
import { Separator } from "@workspace/ui/components/separator";
import type { Student } from "../api";
import { useCallback, useState, useTransition } from "react";
import ButtonDialog from "@workspace/ui/components/dialog-button";
import DownloadMultipleSupplements from "./download-multiple-supplements";
// import ButtonDialog from "@/components/dialog-button";

// import { useMutation } from "@tanstack/react-query";
// import { toast } from "sonner";
// // import { getStudents } from "../api";
// import { useSearchParams } from "react-router";
// import { searchParamsCache } from "../api/validations";
// import { getValidFilters } from "@/lib/data-table";

// import { exportTableToCSV } from "@/lib/export";
// import { deleteTasks, updateTasks } from "../_lib/actions";
// import { deletePreApplication } from "../api";
// import { toast } from "sonner";

const actions = [
    "update-status",
    "update-priority",
    "export",
    "delete",
    "actions"
] as const;

type Action = (typeof actions)[number];

interface StudentsTableActionBarProps {
    table: Table<Student>;
    templates: { id: string; name: string }[];
}


// const tasks = {
//     status: {
//         enumValues: ["Active", "Inactive"],
//     },
//     priority: {
//         enumValues: ["high", "low"],
//     },
// };
export function StudentsTableActionBar({ table , templates }: StudentsTableActionBarProps) {
    // const [searchParams] = useSearchParams()
    // const search = searchParamsCache.parse(Object.fromEntries(searchParams.entries()));
    // const validFilters = getValidFilters(search.filters);
    // const mutation = useMutation({
    //     mutationFn: getStudents,
    //     onSuccess: (data) => {
    //         window.open(data?.data?.url, '_blank');
    //     },
    //     onError: (error) => {
    //         toast.error(error.message);
    //     }
    // });
    const rows = table.getFilteredSelectedRowModel().rows;
    const [isPending] = useTransition();
    const [currentAction, setCurrentAction] = useState<Action | null>(null);

    const getIsActionPending = useCallback(
        (action: Action) => isPending && currentAction === action,
        [isPending, currentAction],
    );


    const onTaskExport = useCallback(() => {
        setCurrentAction("export");
        // mutation.mutate({
        //     ...search, filters: validFilters, exportAll: true,
        //     ids: table.getFilteredSelectedRowModel().rows.map(row => row.original.id)
        // });
    }, [table]);


    return (
        <DataTableActionBar table={table} visible={rows.length > 0}>
            <DataTableActionBarSelection table={table} />
            <Separator
                orientation="vertical"
                className="hidden data-[orientation=vertical]:h-5 sm:block"
            />
            <div className="flex items-center gap-1.5">
                <ButtonDialog
                 triggerButton={<DownloadMultipleSupplements students={table.getFilteredSelectedRowModel().rows} templates={templates} />} >
                    <DataTableActionBarAction
                        size="icon"
                        tooltip="Export Suplementet"
                        isPending={getIsActionPending("export")}
                        onClick={onTaskExport}
                    >
                        <Download />
                    </DataTableActionBarAction>
                </ButtonDialog>


                {/* <ButtonDialog view={<MailComponent employees={table.getFilteredSelectedRowModel().rows.map(row => row.original.id)} />} >
                    <DataTableActionBarAction
                        size="icon"
                        tooltip="Send Email"
                    >
                        <Mail />
                    </DataTableActionBarAction>
                </ButtonDialog> */}
            </div>
        </DataTableActionBar>
    );
}