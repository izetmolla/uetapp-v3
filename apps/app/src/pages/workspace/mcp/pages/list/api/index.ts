import ApiService, { withWs, withAPI } from "@workspace/flowtrove/lib/network";
import z from "zod";


export interface MCPListItem {
    id: string;
    name: string;
    token: string;
    allowed_ips: string[];
    expires_at: string;
    status: string;
}

export interface MCPListDataTypes {
    statistics: {
        total_tokens: number;
        total_calls: number;
        total_failed_calls: number;
        total_success_calls: number;
    };
    mcp: {
        data: MCPListItem[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            total_pages: number;
        };
    };
}

export function getMCPListData() {
    return ApiService.fetchDataBody<MCPListDataTypes>({
        url: withAPI('/mcp/list'),
        method: 'get',
        params: withWs(),
    });
}



// Create MCP Token

interface CreateMCPTokenDataTypes {
    name: string;
    expires_at: string;
}
export function createMCPToken(data: Record<string, unknown>) {
    return ApiService.fetchDataBody<CreateMCPTokenDataTypes>({
        url: withAPI('/mcp/create'),
        method: 'post',
        data: withWs(data),
    });
}
export const createMCPTokenSchema = z.object({
    ws: z.string().min(1, {
        message: "ws is required."
    }),
    name: z.string().min(2, {
        message: "name must be at least 2 characters."
    }),
    expires_at: z.date().optional()
});
export type CreateMCPTokenSchemaTypes = z.infer<typeof createMCPTokenSchema>;