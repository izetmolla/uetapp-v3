import { DataTable, useBackendColumns } from "@workspace/flowtrove/components/datatable";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessageFromBody, isApiErrorBody, queryClient } from "@workspace/flowtrove/lib/network";
import ContentLoader, { type BreadcrumbItem } from "@workspace/flowtrove/components/content-loader";
import type { DataTableRowAction } from "@workspace/flowtrove/components/datatable/types/data-table";
import { useTranslation } from "react-i18next";
import { Button } from "@workspace/ui/components/button";
import { PlusIcon } from "lucide-react";
import DeleteRecordAlert from "../../components/delete-record-alert";
import {
    deleteAcademicYears,
    getAcademicYearsColumns,
    getAcademicYearsList,
    type AcademicYear,
} from "./api";
import { getActionsColumn, prependColumns } from "./components/table-columns";
import TableConfigCustomizator from "./components/table-config-customizator";
import { AcademicYearsTableActionBar } from "./components/table-action-bar";
import AcademicYearFormDialog from "./components/form-dialog";
import { useAcademicYearsListStore } from "./store";

export const ACADEMIC_YEARS_FETCH_KEY = "academicYearsPage";

const breadcrumb: BreadcrumbItem[] = [
    { label: "Admin", to: "/admin" },
    { label: "Org Units", to: "/admin/orgunits" },
];

const AcademicYearsPage = () => {
    const { t } = useTranslation("admin");
    const [rowAction, setRowAction] = useState<DataTableRowAction<AcademicYear> | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const { setIsFormDialogOpen } = useAcademicYearsListStore();
    const listQueryKey = [ACADEMIC_YEARS_FETCH_KEY, "list"] as const;

    const { columns, isLoading: columnsLoading, error, columnVisibility } = useBackendColumns<AcademicYear>({
        fetchColumns: async () => getAcademicYearsColumns(),
        queryKey: [ACADEMIC_YEARS_FETCH_KEY, "columns"],
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
        mutationFn: (ids: string[]) => deleteAcademicYears(ids),
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, t("Failed to delete")), { richColors: true });
                return;
            }
            toast.success(t("Academic year deleted successfully"), { richColors: true });
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
            title={t("Academic Years")}
            isLoading={columnsLoading}
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
                        {t("Add Academic Year")}
                    </Button>
                    <TableConfigCustomizator />
                </div>
            }
        >
            <DataTable<AcademicYear>
                columns={columns}
                source={{
                    type: "server",
                    options: {
                        fetch: (state) => getAcademicYearsList(state),
                        queryKey: (state) => [ACADEMIC_YEARS_FETCH_KEY, "list", state],
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
                actionBar={(table) => <AcademicYearsTableActionBar table={table} />}
            />
            <AcademicYearFormDialog
                record={editRecord}
                queryKey={listQueryKey}
                onClose={() => setRowAction(null)}
            />
            <DeleteRecordAlert
                open={deleteOpen}
                onOpenChange={(open) => {
                    setDeleteOpen(open);
                    if (!open) setRowAction(null);
                }}
                isPending={deleteMutation.isPending}
                title={t("Delete academic year?")}
                description={t('This will permanently delete "{{year}}". This action cannot be undone.', {
                    year: deleteRecord?.year ?? "",
                })}
                onConfirm={() => deleteRecord?.id && deleteMutation.mutate([deleteRecord.id])}
            />
        </ContentLoader>
    );
};

export default AcademicYearsPage;
