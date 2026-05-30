import { DataTable, useBackendColumns } from "@workspace/flowtrove/components/datatable";
import type { FC } from "react";
import {
    SYNC_STUDENTS_FETCH_PERSISTANT,
    getImportStudentsColumns,
    getImportStudentsList,
    type Student,
} from "../api";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { getActionsColumn, getColumnOverrides } from "./table-columns";
import { ImportStudentsActions } from "./table-actions";




interface ImportStudentsDatatableProps {
    withParams?: Record<string, unknown>;
    onSuccess?: (data?: unknown) => void;
    onError?: (error: Error) => void;
}
const ImportStudentsDatatable: FC<ImportStudentsDatatableProps> = ({
    withParams = {},
    onSuccess,
    onError,
}) => {
    const { columns, isLoading: columnsLoading, error, columnVisibility } = useBackendColumns<Student>({
        fetchColumns: async (filters) => getImportStudentsColumns(filters),
        queryKey: [SYNC_STUDENTS_FETCH_PERSISTANT, "columns"],
        appendColumns: getActionsColumn(),
        overrideColumns: getColumnOverrides(),
    });


    return (
        <div className="flex h-full min-h-0 flex-1 flex-col">
            <ContentLoader
                isLoading={columnsLoading}
                error={error}
                forMeta
                centered
            >
                <div className="flex h-full min-h-0 flex-1 flex-col">
                    <DataTable<Student>
                        className="h-full"
                        fillHeight
                        showTotalRows
                        stickyHeader={true}
                        columns={columns}
                        source={{
                            type: "server",
                            options: {
                                fetch: (state) => getImportStudentsList(state),
                                queryKey: (state) => [SYNC_STUDENTS_FETCH_PERSISTANT, "students", state],
                                initialPerPage: 10,
                            },
                        }}
                        initialState={{
                            sorting: [{ id: "sp_id", desc: true }],
                            columnPinning: { right: ["actions"] },
                            columnVisibility,
                        }}
                        getRowId={(row) => String(row.sp_id)}
                        enableToolbar
                        enableAdvancedFilter
                        enablePagination
                        rowIdKey="sp_id"
                        enableRowSelection
                        disableParamPersistence={true}
                        actionBar={(table) => (
                            <ImportStudentsActions
                                table={table}
                                withParams={withParams}
                                onSuccess={onSuccess}
                                onError={onError}
                            />
                        )}
                    />
                </div>
            </ContentLoader>
        </div>
    );
};

export default ImportStudentsDatatable;