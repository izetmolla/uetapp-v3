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
}
type student = {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    id_number: string;
    pasport_number: string;
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