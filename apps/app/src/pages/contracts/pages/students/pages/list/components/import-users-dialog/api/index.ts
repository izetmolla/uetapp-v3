import type { BackendColumnsResponse } from "@workspace/flowtrove/components/data-table";
import ApiService, { type ResponseWithError, type ResponseWithPagination, withAPI } from "@workspace/flowtrove/lib/network";

export const IMPORT_STUDENTS_FETCH_PERSISTANT = "import-contracts-students";

export const IMPORT_STUDENTS_LIST_BASE = "/contracts/students/import";

export interface Student {
    id: number;
    firstname: string;
    lastname: string;
    email?: string;
    id_number?: string;
    pasport_number?: string;
    status?: string;
    user_id?: string;
    full_name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ImportStudentsMutationResponse extends ResponseWithError {
    success?: boolean;
    message?: string;
    students?: Student[];
    updated?: number;
}



type ImportStudentsColumnsResponse = BackendColumnsResponse & ResponseWithError;

export async function getImportStudentsList(params: unknown) {
    return ApiService.fetchData<ResponseWithPagination<Student>>({
        url: withAPI(IMPORT_STUDENTS_LIST_BASE),
        method: "get",
        params,
    });
}

export async function getImportStudentsColumns() {
    return ApiService.fetchData<ImportStudentsColumnsResponse>({
        url: withAPI(`${IMPORT_STUDENTS_LIST_BASE}/columns`),
        method: "get",
    });
}

