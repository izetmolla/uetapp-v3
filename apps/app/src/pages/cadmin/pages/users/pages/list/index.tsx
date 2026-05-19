import { DataTable, useBackendColumns } from "@workspace/flowtrove/components/data-table";
import { USER_FETCH_PERSISTANT, type User } from "./api";
import { getUsersColumns, getUsersList } from "./api";
import ContentLoader, { type BreadcrumbItem } from "@workspace/flowtrove/components/content-loader";
import { getActionsColumn, getColumnOverrides } from "./components/table-columns";
import StatsCard from "./components/stats-card";
import TableConfigCustomizator from "./components/table-config-customizator";
import QuickEditUser from "./components/quick-edit-user";
import useUsersListStore from "./store";
import { Button } from "@workspace/ui/components/button";
import { UserPlus } from "lucide-react";
import DeleteUserDialog from "./components/delete-user-dialog";
import DisableUserDialog from "./components/disable-user-dialog";
import EnableUserDialog from "./components/enable-user-dialog";
import { useTranslation } from "react-i18next";
import { UsersTableActionBar } from "./components/table-action-bar";

const breadcrumb: BreadcrumbItem[] = [
    { label: "Admin", to: "/admin" }
];

const UsersListPage = () => {
    const { t } = useTranslation("admin");
    const openCreateUser = useUsersListStore((s) => s.openCreateUser);

    const {
        columns,
        isLoading: columnsLoading,
        error,
        columnVisibility,
    } = useBackendColumns<User>({
        fetchColumns: async () => getUsersColumns().then((res) => res.data),
        queryKey: [USER_FETCH_PERSISTANT, "columns"],
        appendColumns: getActionsColumn(),
        overrideColumns: getColumnOverrides(),
    });

    return (
        <ContentLoader
            breadcrumb={breadcrumb}
            title={t("Users Management")}
            isLoading={columnsLoading}
            error={error}
            showHeaderSeparator
            rightComponent={
                <div className="flex w-full items-end justify-end mb-2 gap-1">
                    <Button type="button" variant="default" onClick={openCreateUser}>
                        <UserPlus className="size-4" aria-hidden />
                        {t("Add User")}
                    </Button>
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
                        fetch: (state) => getUsersList(state).then((res) => res.data),
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
            />
            <QuickEditUser />
            <DeleteUserDialog />
            <DisableUserDialog />
            <EnableUserDialog />
        </ContentLoader>
    );
};

export default UsersListPage;
