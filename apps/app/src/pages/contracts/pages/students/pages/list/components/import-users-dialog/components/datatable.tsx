import { DataTable, useBackendColumns } from "@workspace/flowtrove/components/data-table";
import type { FC } from "react";
import type { Student } from "../../quick-edit-student/api";
import {
    IMPORT_STUDENTS_FETCH_PERSISTANT,
    getImportStudentsColumns,
    getImportStudentsList,
} from "../api";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { getActionsColumn, getColumnOverrides } from "./table-columns";





const ImportStudentsDatatable: FC = () => {
    const { columns, isLoading: columnsLoading, error, columnVisibility } = useBackendColumns<Student>({
        fetchColumns: async (filters) => getImportStudentsColumns(filters),
        queryKey: [IMPORT_STUDENTS_FETCH_PERSISTANT, "columns"],
        appendColumns: getActionsColumn(),
        overrideColumns: getColumnOverrides(),
    });


    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ContentLoader
                isLoading={columnsLoading}
                error={error}
                forMeta
                centered
            >
            <DataTable<Student>
                columns={columns}
                source={{
                    type: "server",
                    options: {
                        fetch: (state) => getImportStudentsList(state),
                        queryKey: (state) => [IMPORT_STUDENTS_FETCH_PERSISTANT, "students", state],
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
        </ContentLoader>
        </div>
    );
};

export default ImportStudentsDatatable;