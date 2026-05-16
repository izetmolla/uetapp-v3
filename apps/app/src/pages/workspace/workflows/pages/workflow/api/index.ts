import ApiService, { withAPI, withWs, type ResponseWithError } from "@workspace/flowtrove/lib/network";
import type { Workflow } from "@/components/workflow/types";

export interface GetWorkflowResponse {
    workflow: Workflow;
}

export function getWorkflow(params: Record<string, unknown>): Promise<GetWorkflowResponse> {
    return ApiService.fetchDataBody<GetWorkflowResponse>({
        url: withAPI('/backends/workflow'),
        method: "get",
        params: withWs(params),
    });
}


export type UpdateWorkflowResponse = ResponseWithError;
export function updateWorkflow(params: Record<string, unknown>): Promise<UpdateWorkflowResponse> {
    return ApiService.fetchDataBody<UpdateWorkflowResponse>({
        url: withAPI('/backends/update-workflow-name'),
        method: "POST",
        params: withWs(params),
    });
}