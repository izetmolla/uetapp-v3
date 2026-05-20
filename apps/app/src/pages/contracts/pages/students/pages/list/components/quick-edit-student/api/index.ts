import ApiService, { type ResponseWithError, withAPI } from "@workspace/flowtrove/lib/network";
import {
    STUDENTS_LIST_BASE,
    type Student,
    type StudentMutationResponse,
} from "../../../api";
import { parseStudentInput, type StudentFormValues } from "../schemas";

export type { Student, StudentMutationResponse };

export interface StudentDetailResponse extends ResponseWithError {
    student: Student;
}

export function getStudentDetail(id: number) {
    return ApiService.fetchData<StudentDetailResponse>({
        url: withAPI(`${STUDENTS_LIST_BASE}/${id}`),
        method: "get",
    });
}

export function getStudentCreateTemplate() {
    return ApiService.fetchData<StudentDetailResponse>({
        url: withAPI(`${STUDENTS_LIST_BASE}/new`),
        method: "get",
    });
}

export function createStudent(data: StudentFormValues) {
    return ApiService.fetchData<StudentMutationResponse>({
        url: withAPI(STUDENTS_LIST_BASE),
        method: "post",
        data: parseStudentInput(data),
    });
}

export function updateStudent(id: number, data: StudentFormValues) {
    return ApiService.fetchData<StudentMutationResponse>({
        url: withAPI(`${STUDENTS_LIST_BASE}/${id}`),
        method: "put",
        data: parseStudentInput(data),
    });
}
