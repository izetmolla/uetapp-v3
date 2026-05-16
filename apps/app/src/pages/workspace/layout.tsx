import ContentLoader from "@workspace/flowtrove/components/content-loader";
import ApiService, { withError, withWs, withAPI, withInitialData } from "@workspace/flowtrove/lib/network";
import { useQuery } from "@tanstack/react-query";
import { Outlet, useParams } from "react-router"
import { Suspense } from "react";
import Loader from "@workspace/flowtrove/components/loader";


interface WorkspaceDataTypes {
    workspace: {
        id: string;
    }
}
export function getWorkspaceData() {
    return ApiService.fetchDataBody<WorkspaceDataTypes>({
        url: withAPI('/ws'),
        method: 'get',
        params: withWs(),
    });
}


const WorkspaceLayout = () => {
    const { ws } = useParams();
    const { isLoading, error, data } = useQuery({
        queryKey: ["workspace-data", ws],
        queryFn: () => getWorkspaceData(),
        ...withInitialData<WorkspaceDataTypes>(),
    })

    return (
        <Suspense fallback={<Loader fullScreen />}>
            <ContentLoader isLoading={isLoading} error={withError(error, data)}>
                <Outlet />
            </ContentLoader>
        </Suspense>
    )
}

export default WorkspaceLayout