import { DataTable, useBackendColumns } from "@workspace/flowtrove/components/data-table";
import { useMemo, useState } from "react";
import { getUsersColumns, getUsersList, type User } from "./api";
import ContentLoader, { type BreadcrumbItem } from "@workspace/flowtrove/components/content-loader";
import { getActionsColumn, prependColumns } from "./components/table-columns";
import StatsCard from "./components/stats-card";
import TableConfigCustomizator from "./components/table-config-customizator";
import QuickUserEdit from "./components/quick-user-edit";
import type { DataTableRowAction } from "@workspace/flowtrove/components/data-table/types/data-table";
import { useTranslation } from "react-i18next";
import { UsersTableActionBar } from "./components/table-action-bar";

export const USER_FETCH_PERSISTANT = "userspage"

const breadcrumb: BreadcrumbItem[] = [
    { label: "Admin", to: "/admin" }
];

const UsersListPage = () => {
    const { t } = useTranslation("admin");
    const [rowAction, setRowAction] = useState<DataTableRowAction<User> | null>(null);
    const {
        columns,
        isLoading: columnsLoading,
        error,
        columnVisibility,
    } = useBackendColumns<User>({
        fetchColumns: async () => getUsersColumns().then(res => res.data),
        queryKey: [USER_FETCH_PERSISTANT, "columns"],
        appendColumns: getActionsColumn(setRowAction),
        // prependColumns: prependColumns(),
        overrideColumns: prependColumns()
    });



    const quickEditUser = useMemo(() => {
        if (rowAction?.variant === "quickEdit" && rowAction?.row.original) {
            return rowAction?.row.original;
        }
        return null;
    }, [rowAction?.variant, rowAction?.row.original]);

    return (
        <ContentLoader
            breadcrumb={breadcrumb}
            title={t("Users Management")}
            isLoading={columnsLoading}
            error={error}
            showHeaderSeparator
            rightComponent={
                <div className="flex w-full items-end justify-end mb-2 gap-1">
                    <QuickUserEdit user={quickEditUser} isOpen={!!quickEditUser} onClose={() => setRowAction(null)} />
                    <TableConfigCustomizator />
                </div>
            }
        >
            <StatsCard />
            <DataTable<User>
                columns={columns}
                source={{
                    type: "server",
                    options: {
                        fetch: (state) => getUsersList(state).then(res => res.data),
                        queryKey: (state) => [USER_FETCH_PERSISTANT, "users", state],
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
                actionBar={(table) => <UsersTableActionBar table={table} />}
            // onSelectionChange={setSelectedRows}
            />

        </ContentLoader>
    );
}

export default UsersListPage;