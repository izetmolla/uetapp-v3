import type { BackendColumnsResponse } from "@workspace/flowtrove/components/datatable";
import ApiService, { type ResponseWithError, type ResponseWithPagination, withAPI } from "@workspace/flowtrove/lib/network";

export interface Department {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    status: string;
    faculty_id: string;
    faculty_name?: string;
    created_at: string;
    updated_at: string;
}

type DepartmentColumnsResponse = BackendColumnsResponse & ResponseWithError;

export interface DepartmentMutationResponse extends ResponseWithError {
    success?: boolean;
    message?: string;
    department?: Department;
    deleted?: number;
}

const listBase = "/cadmin/orgunits/departments/list";

export async function getDepartmentsList(params: unknown) {
    return ApiService.fetchData<ResponseWithPagination<Department>>({
        url: withAPI(listBase),
        method: "get",
        params,
    });
}

export async function getDepartmentsColumns() {
    return ApiService.fetchData<DepartmentColumnsResponse>({
        url: withAPI(`${listBase}/columns`),
        method: "get",
    });
}

export function createDepartment(data: Record<string, unknown>) {
    return ApiService.fetchDataBody<DepartmentMutationResponse>({
        url: withAPI(listBase),
        method: "post",
        data,
    });
}

export function updateDepartment(id: string, data: Record<string, unknown>) {
    return ApiService.fetchDataBody<DepartmentMutationResponse>({
        url: withAPI(`${listBase}/${id}`),
        method: "put",
        data,
    });
}

export function deleteDepartments(ids: string[]) {
    return ApiService.fetchDataBody<DepartmentMutationResponse>({
        url: withAPI(listBase),
        method: "delete",
        data: { ids },
    });
}
