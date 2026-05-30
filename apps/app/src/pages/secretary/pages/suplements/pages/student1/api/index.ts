import type {
    BackendColumnDefinition,
    BackendColumnsResponse,
} from "@workspace/flowtrove/components/datatable";
import ApiService, {
    type ResponseWithError,
    type ResponseWithPagination,
    withAPI,
    withService,
} from "@workspace/flowtrove/lib/network";

export interface Student {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    student_code: string;
    image: string;
    study_level: string;
    status: string;
    faculty_name: string;
    faculty_code: string;
    full_name: string;
    study_profile_id: string;
    faculty_id: string;
    study_program_name: string;
    study_program_code: string;
    study_program_id: string;
    study_profile_name: string;
    graduated_at: string;
    created_at: string;
}

export type StudentsColumnsResponse = BackendColumnsResponse &
    ResponseWithError & {
        columnVisibility?: Record<string, boolean>;
    };

export type { BackendColumnDefinition };

export interface StudentsListResponse extends ResponseWithPagination<Student> {
    templates?: { id: string; name: string }[];
}

export async function getStudentsColumns(filters?: Record<string, unknown>) {
    return ApiService.fetchData<StudentsColumnsResponse>({
        url: withAPI("/secretary/suplements/students/columns"),
        method: "get",
        params: filters,
    });
}

export async function getStudentsList(params: unknown) {
    return ApiService.fetchData<StudentsListResponse>({
        url: withAPI("/secretary/suplements/students"),
        method: "get",
        params,
    });
}

export interface CreateSingleSupplementResponse extends ResponseWithError {
    message: string;
    download_url: string;
}

export async function createSingleSupplementRequest(data: Record<string, unknown>) {
    return ApiService.fetchData<CreateSingleSupplementResponse>({
        url: withAPI(`/secretary/suplements/students/createsingle`),
        method: "post",
        data: withService(data),
    });
}
