import { DataTable, useBackendColumns } from "@workspace/flowtrove/components/data-table";
import ContentLoader, { type BreadcrumbItem } from "@workspace/flowtrove/components/content-loader";
import {
    STUDENTS_FETCH_PERSISTANT,
    type Student,
    getStudentsColumns,
    getStudentsList,
} from "./api";
import { getActionsColumn, getColumnOverrides } from "./components/table-columns";
import StatsCard from "./components/stats-card";
import StudentsListHeaderActions from "./components/list-header-actions";
import QuickEditStudent from "./components/quick-edit-student";
import DisableStudentDialog from "./components/disable-student-dialog";
import EnableStudentDialog from "./components/enable-student-dialog";
import SyncStudentsDialog from "@/pages/contracts/components/syncstudents";
import useStudentsListStore from "./store";
import { queryClient } from "@workspace/flowtrove/lib/network";

const breadcrumb: BreadcrumbItem[] = [
    { label: "Contracts", to: "/contracts" },
];

const StudentsListPage = () => {
    const { isSyncStudentsDialogOpen, setSyncStudentsDialogOpen } = useStudentsListStore();
    const queryKey = [STUDENTS_FETCH_PERSISTANT, "students"];

    const { columns, isLoading: columnsLoading, error, columnVisibility } = useBackendColumns<Student>({
        fetchColumns: async () => getStudentsColumns(),
        queryKey: queryKey,
        appendColumns: getActionsColumn(),
        overrideColumns: getColumnOverrides(),
    });

    return (
        <ContentLoader
            breadcrumb={breadcrumb}
            title="Students"
            isLoading={columnsLoading}
            error={error}
            showHeaderSeparator
            headerClassName="items-end gap-4"
            rightComponent={<StudentsListHeaderActions />}
        >
            <StatsCard />
            <DataTable<Student>
                columns={columns}
                source={{
                    type: "server",
                    options: {
                        fetch: (state) => getStudentsList(state),
                        queryKey: (state) => [STUDENTS_FETCH_PERSISTANT, "students", state],
                        initialPerPage: 10,
                    },
                }}
                initialState={{
                    sorting: [{ id: "created_at", desc: true }],
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
            <QuickEditStudent />
            <DisableStudentDialog />
            <EnableStudentDialog />
            <SyncStudentsDialog
                // onSuccess={() => {
                //     // void queryClient.invalidateQueries({ queryKey });

                //     setSyncStudentsDialogOpen(false);
                // }}
                // onError={(error) => {
                //     toast.error(error.message);
                // }}
                isOpen={isSyncStudentsDialogOpen}
                onClose={() => {
                    setSyncStudentsDialogOpen(false)
                    void queryClient.invalidateQueries({ queryKey });
                }}
                withParams={{
                    CUSTOM_URL: "/contracts/students/import",
                }}
            />
        </ContentLoader>
    );
};

export default StudentsListPage;
