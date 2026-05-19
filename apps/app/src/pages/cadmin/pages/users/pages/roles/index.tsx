import { DataTable, useBackendColumns } from "@workspace/flowtrove/components/data-table";
import ContentLoader, { type BreadcrumbItem } from "@workspace/flowtrove/components/content-loader";
import { Button } from "@workspace/ui/components/button";
import { ShieldPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROLES_FETCH_PERSISTANT, type Role, getRolesColumns, getRolesList } from "./api";
import { getActionsColumn, getColumnOverrides } from "./components/table-columns";
import StatsCard from "./components/stats-card";
import TableConfigCustomizator from "./components/table-config-customizator";
import QuickEditRole from "./components/quick-edit-role";
import useRolesListStore from "./store";
import DeleteRoleDialog from "./components/delete-role-dialog";
import DisableRoleDialog from "./components/disable-role-dialog";
import EnableRoleDialog from "./components/enable-role-dialog";

const breadcrumb: BreadcrumbItem[] = [
    { label: "Admin", to: "/admin" },
    { label: "Users", to: "/cadmin/users" },
];

const RolesListPage = () => {
    const { t } = useTranslation("admin");
    const openCreateRole = useRolesListStore((s) => s.openCreateRole);

    const { columns, isLoading: columnsLoading, error, columnVisibility } = useBackendColumns<Role>({
        fetchColumns: async () => getRolesColumns(),
        queryKey: [ROLES_FETCH_PERSISTANT, "columns"],
        appendColumns: getActionsColumn(),
        overrideColumns: getColumnOverrides(),
    });

    return (
        <ContentLoader
            breadcrumb={breadcrumb}
            title={t("Roles Management")}
            isLoading={columnsLoading}
            error={error}
            showHeaderSeparator
            rightComponent={
                <div className="mb-2 flex w-full items-end justify-end gap-1">
                    <Button type="button" variant="default" onClick={openCreateRole}>
                        <ShieldPlus className="size-4" aria-hidden />
                        {t("Add Role")}
                    </Button>
                    <TableConfigCustomizator />
                </div>
            }
        >
            <StatsCard />
            <DataTable<Role>
                columns={columns}
                source={{
                    type: "server",
                    options: {
                        fetch: (state) => getRolesList(state),
                        queryKey: (state) => [ROLES_FETCH_PERSISTANT, "roles", state],
                        initialPerPage: 10,
                    },
                }}
                initialState={{
                    sorting: [{ id: "name", desc: false }],
                    columnPinning: { right: ["actions"] },
                    columnVisibility,
                }}
                getRowId={(row) => String(row.id)}
                enableToolbar
                enableAdvancedFilter
                enablePagination
                rowIdKey="id"
                enableRowSelection
            />
            <QuickEditRole />
            <DeleteRoleDialog />
            <DisableRoleDialog />
            <EnableRoleDialog />
        </ContentLoader>
    );
};

export default RolesListPage;
