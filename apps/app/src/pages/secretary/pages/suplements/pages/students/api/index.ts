import ApiService, { withAPI, withService, type ResponseWithError } from "@workspace/flowtrove/lib/network";


export interface Office {
    id: string;
    name: string;
    description: string;
    created_at: string;
}

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

export interface GetSupplementStudentsResponse extends ResponseWithError {
    url: string
    students: Student[]
    pageCount: number
    templates: { id: string; name: string }[]
    options?: {
        filter_items: any[]
    }
}


export async function getSupplementStudents(params: Record<string, unknown>) {
    return ApiService.fetchData<GetSupplementStudentsResponse>({
        url: withAPI(`/secretary/suplements/students`),
        method: 'get',
        params: withService(params)
    })
}

interface ColumnsResponse extends ResponseWithError {
    columns: any[];
    columnVisibility?: Record<string, boolean>;
}

export async function getSupplementStudentsColumns() {
    return ApiService.fetchData<ColumnsResponse>({
        url: withAPI('/secretary/suplements/students/columns'),
        method: 'get',
    });
}




export interface GetSingleStudentResponse extends ResponseWithError {
    student: Student
}

export async function getSingleStudent(id: string) {
    return ApiService.fetchData<GetSingleStudentResponse>({
        url: withAPI(`/secretary/suplements/students/student`),
        method: 'get',
        params: withService({ id })
    })
}



export interface CreateSingleSupplementRequest {
    student_id: string;
    document_name: string;
    template_id: string;
}

export interface CreateSingleSupplementResponse extends ResponseWithError {
    message: string;
    download_url: string;
}

export async function createSingleSupplementRequest(data: Record<string, unknown>) {
    return ApiService.fetchData<CreateSingleSupplementResponse>({
        url: withAPI(`/secretary/suplements/students/createsingle`),
        method: 'post',
        data: withService(data)
    })
}