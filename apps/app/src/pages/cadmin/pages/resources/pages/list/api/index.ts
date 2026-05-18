import type { BackendColumnsResponse } from "@workspace/flowtrove/components/data-table";
import ApiService, { type ResponseWithError, type ResponseWithPagination, withAPI } from "@workspace/flowtrove/lib/network";

export interface Resource {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

type ResourceColumnsResponse = BackendColumnsResponse & ResponseWithError;

export interface ResourceMutationResponse extends ResponseWithError {
    success?: boolean;
    message?: string;
    resource?: Resource;
    deleted?: number;
}

const listBase = "/cadmin/resources/list";

export async function getResourcesList(params: unknown) {
    return ApiService.fetchData<ResponseWithPagination<Resource>>({
        url: withAPI(listBase),
        method: "get",
        params,
    });
}

export async function getResourcesColumns() {
    return ApiService.fetchData<ResourceColumnsResponse>({
        url: withAPI(`${listBase}/columns`),
        method: "get",
    });
}

export function createResource(data: { name: string; description?: string }) {
    return ApiService.fetchDataBody<ResourceMutationResponse>({
        url: withAPI(listBase),
        method: "post",
        data,
    });
}

export function updateResource(id: string, data: { name: string; description?: string }) {
    return ApiService.fetchDataBody<ResourceMutationResponse>({
        url: withAPI(`${listBase}/${id}`),
        method: "put",
        data,
    });
}

export function deleteResources(ids: string[]) {
    return ApiService.fetchDataBody<ResourceMutationResponse>({
        url: withAPI(listBase),
        method: "delete",
        data: { ids },
    });
}
