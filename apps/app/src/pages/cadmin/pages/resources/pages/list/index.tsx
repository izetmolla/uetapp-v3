import { DataTable, useBackendColumns } from "@workspace/flowtrove/components/data-table";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessageFromBody, isApiErrorBody, queryClient } from "@workspace/flowtrove/lib/network";
import ContentLoader, { type BreadcrumbItem } from "@workspace/flowtrove/components/content-loader";
import type { DataTableRowAction } from "@workspace/flowtrove/components/data-table/types/data-table";
import { useTranslation } from "react-i18next";
import { Button } from "@workspace/ui/components/button";
import { PlusIcon } from "lucide-react";
import DeleteRecordAlert from "../../../orgunits/components/delete-record-alert";
import {
    deleteResources,
    getResourcesColumns,
    getResourcesList,
    type Resource,
} from "./api";
import { getActionsColumn, prependColumns } from "./components/table-columns";
import TableConfigCustomizator from "./components/table-config-customizator";
import ResourceFormDialog from "./components/form-dialog";
import { useResourcesListStore } from "./store";

export const RESOURCES_FETCH_KEY = "resourcesPage";

const breadcrumb: BreadcrumbItem[] = [
    { label: "Admin", to: "/admin" },
    { label: "Resources", to: "/admin/resources" },
];

const ResourcesListPage = () => {
    const { t } = useTranslation("admin");
    const [rowAction, setRowAction] = useState<DataTableRowAction<Resource> | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const { setIsFormDialogOpen } = useResourcesListStore();
    const listQueryKey = [RESOURCES_FETCH_KEY, "list"] as const;

    const { columns, isLoading, error, columnVisibility } = useBackendColumns<Resource>({
        fetchColumns: async () => getResourcesColumns().then((res) => res.data),
        queryKey: [RESOURCES_FETCH_KEY, "columns"],
        appendColumns: getActionsColumn(setRowAction),
        overrideColumns: prependColumns(),
    });

    const editRecord = useMemo(() => {
        if (rowAction?.variant === "quickEdit" && rowAction.row.original) return rowAction.row.original;
        return null;
    }, [rowAction]);

    const deleteRecord = useMemo(() => {
        if (rowAction?.variant === "delete" && rowAction.row.original) return rowAction.row.original;
        return null;
    }, [rowAction]);

    useEffect(() => {
        if (rowAction?.variant === "quickEdit") setIsFormDialogOpen(true);
    }, [rowAction?.variant, setIsFormDialogOpen]);

    useEffect(() => {
        if (rowAction?.variant === "delete") setDeleteOpen(true);
    }, [rowAction?.variant]);

    const deleteMutation = useMutation({
        mutationFn: (ids: string[]) => deleteResources(ids),
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, t("Failed to delete")), { richColors: true });
                return;
            }
            toast.success(t("Resource deleted successfully"), { richColors: true });
            void queryClient.invalidateQueries({ queryKey: listQueryKey });
            setDeleteOpen(false);
            setRowAction(null);
        },
        onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(err?.response?.data?.message ?? err?.message ?? t("Failed to delete"), { richColors: true });
        },
    });

    return (
        <ContentLoader
            breadcrumb={breadcrumb}
            title={t("Resources")}
            isLoading={isLoading}
            error={error}
            showHeaderSeparator
            rightComponent={
                <div className="flex w-full items-end justify-end mb-2 gap-1">
                    <Button
                        onClick={() => {
                            setRowAction(null);
                            setIsFormDialogOpen(true);
                        }}
                    >
                        <PlusIcon className="size-4" />
                        {t("Add Resource")}
                    </Button>
                    <TableConfigCustomizator />
                </div>
            }
        >
            <DataTable<Resource>
                columns={columns}
                source={{
                    type: "server",
                    options: {
                        fetch: (state) => getResourcesList(state).then((res) => res.data),
                        queryKey: (state) => [RESOURCES_FETCH_KEY, "list", state],
                        initialPerPage: 10,
                    },
                }}
                initialState={{
                    sorting: [{ id: "created_at", desc: true }],
                    columnPinning: { right: ["actions"] },
                    columnVisibility,
                }}
                getRowId={(row) => row.id}
                enableToolbar
                enableAdvancedFilter
                enablePagination
                rowIdKey="id"
                enableRowSelection
            />
            <ResourceFormDialog
                record={editRecord}
                queryKey={listQueryKey}
                onClose={() => setRowAction(null)}
            />
            <DeleteRecordAlert
                open={deleteOpen}
                onOpenChange={(open: boolean) => {
                    setDeleteOpen(open);
                    if (!open) setRowAction(null);
                }}
                isPending={deleteMutation.isPending}
                title={t("Delete resource?")}
                description={t('Delete "{{name}}"? This cannot be undone.', { name: deleteRecord?.name ?? "" })}
                onConfirm={() => deleteRecord?.id && deleteMutation.mutate([deleteRecord.id])}
            />
        </ContentLoader>
    );
};

export default ResourcesListPage;
