
import { useQuery } from "@tanstack/react-query";
import { getMCPListData, type MCPListDataTypes } from "./api";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { useParams } from "react-router";
import Stats from "./components/stats";
import ApiKeysDataTable from "./components/keys-table";
import CreateApiKeyDialog from "./components/create-api-key-dialog";
import { useMCPStore } from "./store";
import { withError, withInitialData } from "@workspace/flowtrove/lib/network";

const WsUnits = () => {
    const { isCreateMCPTokenDialogOpen, setIsCreateMCPTokenDialogOpen } = useMCPStore();
    const { ws = "" } = useParams();
    const { isLoading, error, data } = useQuery({
        queryKey: ["mcp-list-data", ws],
        queryFn: () => getMCPListData(),
        ...withInitialData<MCPListDataTypes>(),
    });
    return (
        <ContentLoader isLoading={isLoading} error={withError(error, data)}>
            <div className="space-y-4">
                <div className="flex items-center justify-between space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">MCP Keys Management</h1>
                </div>
                <Stats statistics={data?.statistics || { total_tokens: 0, total_calls: 0, total_failed_calls: 0, total_success_calls: 0 }} />
                <ApiKeysDataTable data={data?.mcp.data || []} />
            </div>
            <CreateApiKeyDialog isOpen={isCreateMCPTokenDialogOpen} onClose={() => setIsCreateMCPTokenDialogOpen(false)} queryKey={["mcp-list-data", ws]} />
        </ContentLoader>
    )
}

export default WsUnits