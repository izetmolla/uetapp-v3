import ApiService, { withAPI, withWs, type ResponseWithError } from "@workspace/flowtrove/lib/network";

export interface SwapEndpointResponse extends ResponseWithError {
    success: boolean;
}

export type SwapEndpointPayload = {
    id: string;
    direction: "up" | "down";
};

export function swapEndpoint(data: SwapEndpointPayload) {
    return ApiService.fetchDataBody<SwapEndpointResponse>({
        url: withAPI("/endpoints/swap-endpoint"),
        method: "post",
        data: withWs(data),
    });
}
