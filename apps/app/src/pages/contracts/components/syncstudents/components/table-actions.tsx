// import { SelectTrigger } from "@radix-ui/react-select";
import type { Table } from "@tanstack/react-table";
import {
    Upload,
} from "lucide-react";
import { Separator } from "@workspace/ui/components/separator";
import { useCallback, useState } from "react";
import { importStudents, type Student } from "../api";
import { DataTableActionBar, DataTableActionBarAction, DataTableActionBarSelection } from "@workspace/flowtrove/components/data-table/components/data-table-action-bar";
import { useImportDialogPortalContainer } from "../portal-container-context";
import { ConfirmAlertDialog } from "./alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDocumentListStore } from "@/pages/contracts/pages/scandocuments/pages/documents/store";

// import { exportTableToCSV } from "@/lib/export";
// import { deleteTasks, updateTasks } from "../_lib/actions";
// import { deletePreApplication } from "../api";
// import { toast } from "sonner";


interface ImportStudentsActionsProps {
    table: Table<Student>;
    withParams?: Record<string, unknown>;
    onSuccess?: (data?: unknown) => void;
    onError?: (error: Error) => void;
}

type ActionConfig = {
    action: string;
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    confirmVariant?: "default" | "destructive";
}
export function ImportStudentsActions({ table, withParams = {}, onSuccess, onError }: ImportStudentsActionsProps) {
    const setIsImportDocumentsDialogOpen = useDocumentListStore((s) => s.setIsImportDocumentsDialogOpen);
    const rows = table.getFilteredSelectedRowModel().rows;
    const mutateImportStudents = useMutation({
        mutationFn: importStudents,
        onSuccess: (data) => {
            if (data.success) {
                if(onSuccess) {
                    onSuccess(data);
                } else {
                    toast.success(data.message);
                }
                table.resetRowSelection();
                setIsImportDocumentsDialogOpen(false);
            } else {
                if(onError) {
                    onError(new Error(data.message));
                } else {
                    toast.error(data.message);
                }
            }
        },
        onError: (error) => {
            if(onError) {
                onError(error);
            } else {
                toast.error(error.message);
            }
        },
    });
    const portalContainer = useImportDialogPortalContainer();
    const [action, setAction] = useState<ActionConfig | null>(null);


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

    const onStudentImportClicked = useCallback(() => {
        setAction({
            action: "import",
            open: true,
            title: "Import students",
            description: "Are you sure you want to import the selected students?",
            confirmLabel: "Import",
        })
    }, [table]);

    const onConfirm = useCallback(() => {
        if (action?.action === "import") {
            mutateImportStudents.mutate({
                ...withParams,
                students: rows.map((row) => row.original.sp_id),
            });
        }
    }, [table, action?.action, withParams]);




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
                    isPending={mutateImportStudents.isPending}
                    onClick={onStudentImportClicked}
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
            {action?.open ? (
                <ConfirmAlertDialog
                    isPending={mutateImportStudents.isPending}
                    open={action?.open}
                    onOpenChange={() => setAction(null)}
                    title={action?.title}
                    description={action?.description}
                    confirmLabel={action.confirmLabel}
                    confirmVariant={action.confirmVariant}
                    onConfirm={onConfirm}
                />
            ) : null}
        </DataTableActionBar>
    );
}