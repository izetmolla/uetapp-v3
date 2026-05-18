import { DataTable, useBackendColumns } from "@workspace/flowtrove/components/data-table";
import { useMemo, useState } from "react";
import { getOrgUnitsColumns, getOrgUnitsList, type OrgUnit } from "./api";
import ContentLoader, { type BreadcrumbItem } from "@workspace/flowtrove/components/content-loader";
import { getActionsColumn, prependColumns } from "./components/table-columns";
import TableConfigCustomizator from "./components/table-config-customizator";
import QuickOrgUnitEdit from "./components/quick-edit";
import type { DataTableRowAction } from "@workspace/flowtrove/components/data-table/types/data-table";
import { useTranslation } from "react-i18next";
import { OrgUnitsTableActionBar } from "./components/table-action-bar";

export const ORG_UNIT_FETCH_PERSISTANT = "orgunitspage"

const breadcrumb: BreadcrumbItem[] = [
    { label: "Admin", to: "/admin" }
];

const OrgUnitsListPage = () => {
    const { t } = useTranslation("admin");
    const [rowAction, setRowAction] = useState<DataTableRowAction<OrgUnit> | null>(null);
    const {
        columns,
        isLoading: columnsLoading,
        error,
        columnVisibility,
    } = useBackendColumns<OrgUnit>({
        fetchColumns: async () => getOrgUnitsColumns().then(res => res.data),
        queryKey: [ORG_UNIT_FETCH_PERSISTANT, "columns"],
        appendColumns: getActionsColumn(setRowAction),
        // prependColumns: prependColumns(),
        overrideColumns: prependColumns()
    });



    const quickEditOrgUnit = useMemo(() => {
        if (rowAction?.variant === "quickEdit" && rowAction?.row.original) {
            return rowAction?.row.original;
        }
        return null;
    }, [rowAction?.variant, rowAction?.row.original]);

    return (
        <ContentLoader
            breadcrumb={breadcrumb}
            title={t("Org Units Management")}
            isLoading={columnsLoading}
            error={error}
            showHeaderSeparator
            rightComponent={
                <div className="flex w-full items-end justify-end mb-2 gap-1">
                    <QuickOrgUnitEdit orgUnit={quickEditOrgUnit} isOpen={!!quickEditOrgUnit} onClose={() => setRowAction(null)} />
                    <TableConfigCustomizator />
                </div>
            }
        >
            <DataTable<OrgUnit>
                columns={columns}
                source={{
                    type: "server",
                    options: {
                        fetch: (state) => getOrgUnitsList(state).then(res => res.data),
                        queryKey: (state) => [ORG_UNIT_FETCH_PERSISTANT, "orgunits", state],
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
                actionBar={(table) => <OrgUnitsTableActionBar table={table} />}
            // onSelectionChange={setSelectedRows}
            />

        </ContentLoader>
    );
}

export default OrgUnitsListPage;