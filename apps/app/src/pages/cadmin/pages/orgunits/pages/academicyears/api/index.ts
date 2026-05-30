import type { BackendColumnsResponse } from "@workspace/flowtrove/components/datatable";
import ApiService, { type ResponseWithError, type ResponseWithPagination, withAPI } from "@workspace/flowtrove/lib/network";

export interface AcademicYear {
    id: string;
    year: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

type AcademicYearColumnsResponse = BackendColumnsResponse & ResponseWithError;

export interface AcademicYearMutationResponse extends ResponseWithError {
    success?: boolean;
    message?: string;
    academic_year?: AcademicYear;
    deleted?: number;
}

const listBase = "/cadmin/orgunits/academicyears/list";

export async function getAcademicYearsList(params: unknown) {
    return ApiService.fetchData<ResponseWithPagination<AcademicYear>>({
        url: withAPI(listBase),
        method: "get",
        params,
    });
}

export async function getAcademicYearsColumns() {
    return ApiService.fetchData<AcademicYearColumnsResponse>({
        url: withAPI(`${listBase}/columns`),
        method: "get",
    });
}

export function createAcademicYear(data: { year: string }) {
    return ApiService.fetchDataBody<AcademicYearMutationResponse>({
        url: withAPI(listBase),
        method: "post",
        data,
    });
}

export function updateAcademicYear(id: string, data: { year: string }) {
    return ApiService.fetchDataBody<AcademicYearMutationResponse>({
        url: withAPI(`${listBase}/${id}`),
        method: "put",
        data,
    });
}

export function deleteAcademicYears(ids: string[]) {
    return ApiService.fetchDataBody<AcademicYearMutationResponse>({
        url: withAPI(listBase),
        method: "delete",
        data: { ids },
    });
}
