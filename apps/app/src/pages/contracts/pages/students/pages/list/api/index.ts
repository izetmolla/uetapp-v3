import type { BackendColumnsResponse } from "@workspace/flowtrove/components/data-table";
import ApiService, { type ResponseWithError, type ResponseWithPagination, withAPI } from "@workspace/flowtrove/lib/network";

export const STUDENTS_FETCH_PERSISTANT = "contracts-students";

export const STUDENTS_LIST_BASE = "/contracts/students/list";

export interface Student {
    id: number;
    firstname: string;
    lastname: string;
    email?: string;
    document_id?: string;
    pasport_number?: string;
    status?: string;
    user_id?: string;
    full_name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface StudentMutationResponse extends ResponseWithError {
    success?: boolean;
    message?: string;
    student?: Student;
    updated?: number;
}

export interface StudentStatItem {
    id: string;
    name: string;
    value: number;
    description: string;
}

export interface StudentsStatsResponse {
    stats: StudentStatItem[];
}

type StudentsColumnsResponse = BackendColumnsResponse & ResponseWithError;

export async function getStudentsList(params: unknown) {
    return ApiService.fetchData<ResponseWithPagination<Student>>({
        url: withAPI(STUDENTS_LIST_BASE),
        method: "get",
        params,
    });
}

export async function getStudentsColumns() {
    return ApiService.fetchData<StudentsColumnsResponse>({
        url: withAPI(`${STUDENTS_LIST_BASE}/columns`),
        method: "get",
    });
}

export async function getStudentsStats() {
    return ApiService.fetchData<StudentsStatsResponse>({
        url: withAPI(`${STUDENTS_LIST_BASE}/stats`),
        method: "get",
    });
}
