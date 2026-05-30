import type { BackendColumnsResponse } from "@workspace/flowtrove/components/datatable";
import ApiService, { type ResponseWithError, type ResponseWithPagination, withAPI } from "@workspace/flowtrove/lib/network";

export interface Faculty {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    status: string;
    created_at: string;
    updated_at: string;
}

type FacultyColumnsResponse = BackendColumnsResponse & ResponseWithError;

export interface FacultyMutationResponse extends ResponseWithError {
    success?: boolean;
    message?: string;
    faculty?: Faculty;
    deleted?: number;
}

const listBase = "/cadmin/orgunits/faculties/list";

export async function getFacultiesList(params: unknown) {
    return ApiService.fetchData<ResponseWithPagination<Faculty>>({
        url: withAPI(listBase),
        method: "get",
        params,
    });
}

export async function getFacultiesColumns() {
    return ApiService.fetchData<FacultyColumnsResponse>({
        url: withAPI(`${listBase}/columns`),
        method: "get",
    });
}

export function createFaculty(data: Record<string, unknown>) {
    return ApiService.fetchDataBody<FacultyMutationResponse>({
        url: withAPI(listBase),
        method: "post",
        data,
    });
}

export function updateFaculty(id: string, data: Record<string, unknown>) {
    return ApiService.fetchDataBody<FacultyMutationResponse>({
        url: withAPI(`${listBase}/${id}`),
        method: "put",
        data,
    });
}

export function deleteFaculties(ids: string[]) {
    return ApiService.fetchDataBody<FacultyMutationResponse>({
        url: withAPI(listBase),
        method: "delete",
        data: { ids },
    });
}
