import ApiService, { withAPI, withWs, type ResponseWithError } from "@workspace/flowtrove/lib/network";

export interface MakeDomainPrimaryDialogDataTypes extends ResponseWithError {
    success?: boolean;
    message?: string;
}

export function makeDomainPrimary(data: Record<string, unknown>) {
    return ApiService.fetchDataBody<MakeDomainPrimaryDialogDataTypes>({
        url: withAPI("/domains/set-primary"),
        method: "post",
        data: withWs(data),
    });
}
