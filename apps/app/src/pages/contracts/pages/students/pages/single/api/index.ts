import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";

type StudyProgram = {
    id: string;
    name: string;
    code: string;
}

type Program = {
    id: string;
    name: string;
    code: string;
    study_program: StudyProgram;
    faculty: {
        id: string;
        name: string;
    };
    reg_year: {
        id: string;
        year: string;
    };
    study_level: {
        id: string;
        name: string;
    };
    speciality: {
        id: string;
        name: string;
    };
}
type student = {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    document_id: string;
    status: string;
    user_id: string;
    programs: Program[];
}

interface StudentDetailResponse {
    student: student;
}

export function getStudentDetail(params: Record<string, unknown>) {
    return ApiService.fetchData<StudentDetailResponse>({
        url: withAPI(`/contracts/students/single`),
        method: "get",
        params,
    });
}


export function syncStudent(data: Record<string, unknown>) {
    return ApiService.fetchData<StudentDetailResponse>({
        url: withAPI(`/contracts/sync/import-students`),
        method: "post",
        data,
    });
}