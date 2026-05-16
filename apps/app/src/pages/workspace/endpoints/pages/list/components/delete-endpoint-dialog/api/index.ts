import ApiService, { withAPI, withWs, type ResponseWithError } from "@workspace/flowtrove/lib/network";

export interface DeleteEndpointDialogDataTypes extends ResponseWithError {
    success: boolean;
}
export function deleteEndpoint(data: Record<string, unknown>) {
    return ApiService.fetchDataBody<DeleteEndpointDialogDataTypes>({
        url: withAPI('/endpoints/delete'),
        method: "DELETE",
        data: withWs(data),
    })
}