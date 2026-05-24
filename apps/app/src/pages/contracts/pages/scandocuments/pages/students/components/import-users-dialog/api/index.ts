import type { BackendColumnsResponse } from "@workspace/flowtrove/components/data-table";
import ApiService, { type ResponseWithError, type ResponseWithPagination, withAPI } from "@workspace/flowtrove/lib/network";

export const IMPORT_STUDENTS_FETCH_PERSISTANT = "import-scandocuments-students";

export const IMPORT_STUDENTS_LIST_BASE = "/contracts/scandocuments/import";

export interface Student {
    student_fid: string;
    sp_id: string;
    person_id: string;
    status: string;
    status_type: string;
    surname: string;
    firstname: string;
    fathersname: string;
    phone: string;
    mobile: string;
    email: string;
    email_uet: string;
    document_id: string;
    document_type: string;
    department: string;
    program_id: string;
    program: string;
    program_specialty: string;
    reg_date: string;
    reg_year: string;
    faculty: string;
    study_level: string;
    nationality: string;
    nat_code: string;
    city: string;
    address: string;
    lastsyncdate: string;
    fullname: string;
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

export async function getImportStudentsColumns(filters?: Record<string, unknown>) {
    return ApiService.fetchData<ImportStudentsColumnsResponse>({
        url: withAPI(`${IMPORT_STUDENTS_LIST_BASE}/columns`),
        method: "get",
        params: filters,
    });
}




export function importStudents(data: Record<string, unknown>) {
    return ApiService.fetchData<ImportStudentsMutationResponse>({
        url: withAPI(`${IMPORT_STUDENTS_LIST_BASE}/import-students`),
        method: "post",
        data,
    });
}