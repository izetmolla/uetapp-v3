import ApiService, { withAPI, withWs, type ResponseWithError } from "@workspace/flowtrove/lib/network";

export interface DeleteDomainDialogDataTypes extends ResponseWithError {
    success?: boolean;
}

export function deleteDomain(data: Record<string, unknown>) {
    return ApiService.fetchDataBody<DeleteDomainDialogDataTypes>({
        url: withAPI("/domains/delete"),
        method: "post",
        data: withWs(data),
    });
}
