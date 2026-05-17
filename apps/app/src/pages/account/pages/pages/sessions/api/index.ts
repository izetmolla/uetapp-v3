import ApiService, {
    type ResponseWithError,
    type ResponseWithPagination,
    withAPI,
} from "@workspace/flowtrove/lib/network"

export interface Session {
    id: string
    user_id?: string
    ip_address?: string
    user_agent?: string
    method?: string
    expires_at?: string
    created_at?: string
    updated_at?: string
}

interface ColumnsResponse extends ResponseWithError {
    columns: any[]
    columnVisibility?: Record<string, boolean>
}

export interface SessionsListResponse extends ResponseWithPagination<Session> {
    current_session_id?: string
}

export async function getSessionsList(params: unknown) {
    return ApiService.fetchData<SessionsListResponse>({
        url: withAPI("/account/sessions/list"),
        method: "get",
        params,
    })
}

export async function getSessionsColumns() {
    return ApiService.fetchData<ColumnsResponse>({
        url: withAPI("/account/sessions/list/columns"),
        method: "get",
    })
}
