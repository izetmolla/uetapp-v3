import { DataTable, useBackendColumns } from "@workspace/flowtrove/components/datatable";
import ContentLoader, { type BreadcrumbItem } from "@workspace/flowtrove/components/content-loader";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { getStudentsColumns, getStudentsList, type Student } from "./api";
import { getActionsColumn, overrideColumns } from "./components/table-columns";
import { StudentsTableActionBar } from "./components/table-action-bar";
import DownloadContentDialog, {
    useDownloadDialog,
} from "../students/components/download-content-dialog";

export const STUDENTS_FETCH_KEY = "supplement-students";

const breadcrumb: BreadcrumbItem[] = [
    { label: "Secretary", to: "/secretary" },
];

const StudentsListPage = () => {
    const { setStudentToDownload, setDialogState, openstudentsToDownload } = useDownloadDialog();
    const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);

    const onDownload = useMemo(
        () => (student: Student) => {
            setStudentToDownload(student);
            setDialogState(true, [student.id]);
        },
        [setDialogState, setStudentToDownload]
    );

    const {
        columns,
        isLoading: columnsLoading,
        error,
        columnVisibility,
    } = useBackendColumns<Student>({
        fetchColumns: async (filters) => getStudentsColumns(filters),
        queryKey: [STUDENTS_FETCH_KEY, "columns"],
        appendColumns: getActionsColumn(onDownload),
        overrideColumns: overrideColumns(),
    });

    useQuery({
        queryKey: [STUDENTS_FETCH_KEY, "templates"],
        queryFn: async () => {
            const res = await getStudentsList({ pagination: { page: 1, perPage: 1 } });
            const next = res?.templates ?? [];
            setTemplates(next);
            return next;
        },
        staleTime: 60_000,
    });

    return (
        <ContentLoader
            breadcrumb={breadcrumb}
            title="Suplementet e studenteve"
            isLoading={columnsLoading}
            error={error}
            showHeaderSeparator
        >
            <DataTable<Student>
                columns={columns}
                source={{
                    type: "server",
                    options: {
                        fetch: async (state) => {
                            const body = await getStudentsList(state);
                            if (body?.templates?.length) {
                                setTemplates(body.templates);
                            }
                            const pagination = body?.pagination;
                            return {
                                data: body?.data ?? [],
                                pagination: {
                                    pageCount:
                                        pagination?.total_pages ??
                                        Number(pagination?.pageCount ?? 0),
                                    total: pagination?.total,
                                    page: pagination?.page,
                                    perPage: pagination?.limit,
                                },
                            };
                        },
                        queryKey: (state) => [STUDENTS_FETCH_KEY, "list", state],
                        initialPerPage: 10,
                    },
                }}
                initialState={{
                    sorting: [{ id: "graduated_at", desc: true }],
                    columnPinning: { right: ["actions"] },
                    columnVisibility,
                }}
                getRowId={(row) => row.id}
                enableToolbar
                enableAdvancedFilter
                enablePagination
                rowIdKey="id"
                enableRowSelection
                actionBar={(table) => (
                    <StudentsTableActionBar table={table} templates={templates} />
                )}
            />
            {openstudentsToDownload && <DownloadContentDialog templates={templates} />}
        </ContentLoader>
    );
};

export default StudentsListPage;
