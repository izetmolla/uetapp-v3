import { useQuery } from "@tanstack/react-query";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { getWorkflow, type GetWorkflowResponse } from "./api";
import { isApiErrorBody, withError, withInitialData } from "@workspace/flowtrove/lib/network";
import { useCallback, useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { useWorkflowStore } from "@/components/workflow/store/workflow";
import Workflow from "@/components/workflow";
import type { WorkflowEditorEventHandler } from "@/components/workflow/types/workflow-editor-events";

const WorkflowPage = () => {
    const { ws = "", workflow_id } = useParams();

    const queryKey = ["workflow", workflow_id];
    const { data, isLoading, error } = useQuery({
        queryKey,
        queryFn: () => getWorkflow({ workflow_id }),
        ...withInitialData<GetWorkflowResponse>(),
        enabled: true,
    });

    const onEvent = useCallback<WorkflowEditorEventHandler>((event, params) => {
        // Call your WebSocket API here (page-owned, not inside the editor app).
        // workflowSocket?.send(JSON.stringify({ event, params, workflowId: workflow_id, ws }));
        console.log("[WorkflowPage]", { event, params, workflowId: workflow_id, ws });

    }, [workflow_id, ws]);
    



    const hasWorkflow = useMemo(
        () => data != null && !isApiErrorBody(data) && data.workflow != null && data.workflow.id !== "",
        [data],
    );




    const workflow = useMemo(() => {
        return window.localStorage.getItem("wf") ? JSON.parse(window.localStorage.getItem("wf") as string) : data?.workflow;
    }, [data]);


    console.log("workflow", workflow);


    useEffect(() => {
        if (data && data?.workflow && data?.workflow?.id !== "" && !isApiErrorBody(data)) {
            useWorkflowStore.getState().setWorkflow(workflow ?? data.workflow);
        }
    }, [data,workflow]);


    const onSave = useCallback((w: any) => {
        console.log("onSave", w);
        window.localStorage.setItem("wf", JSON.stringify(w));
    }, []);

    return (
        <ContentLoader isLoading={isLoading} error={withError(error, data)}>
            {data && hasWorkflow ? (
                <Workflow
                    workflow={workflow}
                    ws={ws}
                    onEvent={onEvent}
                    onSave={onSave}
                />
            ) : (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-16">
                    <p className="text-muted-foreground">Workflow not found.</p>
                </div>
            )}
        </ContentLoader>
    );
};

export default WorkflowPage;
