import { withAPI, withWs, type ResponseWithError, type WithPagination } from "@workspace/flowtrove/lib/network";
import ApiService from "@workspace/flowtrove/lib/network";
import type { Workflow } from "@/components/workflow/types";


export interface WorkflowListResponse extends ResponseWithError {
    workflows: WithPagination<Workflow>;
}



export function getWorkflows(params: Record<string, unknown>): Promise<WorkflowListResponse> {
    console.log(params);
    return ApiService.fetchDataBody<WorkflowListResponse>({
        url: withAPI('/workflows/list'),
        method: 'GET',
        params: withWs(params),
    });
}