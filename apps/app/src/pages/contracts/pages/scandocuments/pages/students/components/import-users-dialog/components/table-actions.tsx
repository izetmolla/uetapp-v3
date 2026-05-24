// import { SelectTrigger } from "@radix-ui/react-select";
import type { Table } from "@tanstack/react-table";
import {
    Upload,
} from "lucide-react";
import { Separator } from "@workspace/ui/components/separator";
import { useCallback, useState, useTransition } from "react";
import type { Student } from "../api";
import { DataTableActionBar, DataTableActionBarAction, DataTableActionBarSelection } from "@workspace/flowtrove/components/data-table/components/data-table-action-bar";
import { useImportDialogPortalContainer } from "../portal-container-context";
// import { exportTableToCSV } from "@/lib/export";
// import { deleteTasks, updateTasks } from "../_lib/actions";
// import { deletePreApplication } from "../api";
// import { toast } from "sonner";

const actions = [
    "update-status",
    "update-priority",
    "export",
    "delete",
] as const;

type Action = (typeof actions)[number];

interface ImportStudentsActionsProps {
    table: Table<Student>;
}


// const tasks = {
//     status: {
//         enumValues: ["Active", "Inactive"],
//     },
//     priority: {
//         enumValues: ["high", "low"],
//     },
// };
export function ImportStudentsActions({ table }: ImportStudentsActionsProps) {
    const rows = table.getFilteredSelectedRowModel().rows;
    const portalContainer = useImportDialogPortalContainer();
    const [isPending, startTransition] = useTransition();
    const [currentAction, setCurrentAction] = useState<Action | null>(null);

    const getIsActionPending = useCallback(
        (action: Action) => isPending && currentAction === action,
        [isPending, currentAction],
    );

    // const onTaskUpdate = React.useCallback(
    //     ({
    //         field,
    //         value,
    //     }: {
    //         field: "status" | "priority";
    //         value: Client["status"] | Client["priority"];
    //     }) => {
    //         setCurrentAction(
    //             field === "status" ? "update-status" : "update-priority",
    //         );
    //         startTransition(async () => {
    //             // const { error } = await updateTasks({
    //             //     ids: rows.map((row) => row.original.id),
    //             //     [field]: value,
    //             // });

    //             // if (error) {
    //             //     toast.error(error);
    //             //     return;
    //             // }
    //             // toast.success("Tasks updated");
    //         });
    //     },
    //     [rows],
    // );

    const onTaskExport = useCallback(() => {
        alert("export");
        setCurrentAction("export");
        startTransition(() => {
            // exportTableToCSV(table, {
            //     excludeColumns: ["select", "actions"],
            //     onlySelected: true,
            // });
        });
    }, [table]);

    // const onTaskDelete = useCallback(() => {
    //     setCurrentAction("delete");
    //     startTransition(() => {
    //         // deletePreApplication({
    //         //     ids: rows.map((row) => row.original.id),
    //         // }).then(res => res.data).then((res) => {
    //         //     if (res.error) {
    //         //         toast.error(res.error.message);
    //         //     } else {
    //         //         toast.success("Client deleted");
    //         //         table.toggleAllRowsSelected(false);
    //         //     }
    //         // }).catch((err) => {
    //         //     toast.success(err?.message || "Error deleting client");
    //         // })
    //     });
    // }, [rows, table]);

    return (
        <DataTableActionBar
            table={table}
            visible={rows.length > 0}
            container={portalContainer}
            className="z-[100]"
        >
            <DataTableActionBarSelection table={table} />
            <Separator
                orientation="vertical"
                className="hidden data-[orientation=vertical]:h-5 sm:block"
            />
            <div className="flex items-center gap-1.5">
                {/* <Select
                    onValueChange={(value: Client["status"]) =>
                        // onTaskUpdate({ field: "status", value })
                        console.log(value)
                    }
                >
                    <SelectTrigger asChild>
                        <DataTableActionBarAction
                            size="icon"
                            tooltip="Update status"
                            isPending={getIsActionPending("update-status")}
                        >
                            <CheckCircle2 />
                        </DataTableActionBarAction>
                    </SelectTrigger>
                    <SelectContent align="center">
                        <SelectGroup>
                            {tasks.status.enumValues.map((status) => (
                                <SelectItem key={status} value={status} className="capitalize">
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select
                    onValueChange={(value: Client["priority"]) =>
                        // onTaskUpdate({ field: "priority", value })
                        console.log(value)
                    }
                >
                    <SelectTrigger asChild>
                        <DataTableActionBarAction
                            size="icon"
                            tooltip="Update priority"
                            isPending={getIsActionPending("update-priority")}
                        >
                            <ArrowUp />
                        </DataTableActionBarAction>
                    </SelectTrigger>
                    <SelectContent align="center">
                        <SelectGroup>
                            {tasks.priority.enumValues.map((priority) => (
                                <SelectItem
                                    key={priority}
                                    value={priority}
                                    className="capitalize"
                                >
                                    {priority}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select> */}
                <DataTableActionBarAction
                className="cursor-pointer"
                    size="icon"
                    tooltip="Import students"
                    isPending={getIsActionPending("export")}
                    onClick={onTaskExport}
                >
                    <Upload />
                </DataTableActionBarAction>
                {/* <DataTableActionBarAction
                    size="icon"
                    tooltip="Delete tasks"
                    isPending={getIsActionPending("delete")}
                    onClick={onTaskDelete}
                >
                    <Trash2 />
                </DataTableActionBarAction> */}
            </div>
        </DataTableActionBar>
    );
}