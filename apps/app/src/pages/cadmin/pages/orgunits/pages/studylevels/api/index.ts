import type { BackendColumnsResponse } from "@workspace/flowtrove/components/datatable";
import ApiService, { type ResponseWithError, type ResponseWithPagination, withAPI } from "@workspace/flowtrove/lib/network";

export interface StudyLevel {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    status: string;
    created_at: string;
    updated_at: string;
}

type StudyLevelColumnsResponse = BackendColumnsResponse & ResponseWithError;

export interface StudyLevelMutationResponse extends ResponseWithError {
    success?: boolean;
    message?: string;
    study_level?: StudyLevel;
    deleted?: number;
}

const listBase = "/cadmin/orgunits/studylevels/list";

export async function getStudyLevelsList(params: unknown) {
    return ApiService.fetchData<ResponseWithPagination<StudyLevel>>({
        url: withAPI(listBase),
        method: "get",
        params,
    });
}

export async function getStudyLevelsColumns() {
    return ApiService.fetchData<StudyLevelColumnsResponse>({
        url: withAPI(`${listBase}/columns`),
        method: "get",
    });
}

export function createStudyLevel(data: Record<string, unknown>) {
    return ApiService.fetchDataBody<StudyLevelMutationResponse>({
        url: withAPI(listBase),
        method: "post",
        data,
    });
}

export function updateStudyLevel(id: string, data: Record<string, unknown>) {
    return ApiService.fetchDataBody<StudyLevelMutationResponse>({
        url: withAPI(`${listBase}/${id}`),
        method: "put",
        data,
    });
}

export function deleteStudyLevels(ids: string[]) {
    return ApiService.fetchDataBody<StudyLevelMutationResponse>({
        url: withAPI(listBase),
        method: "delete",
        data: { ids },
    });
}
