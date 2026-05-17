import {
    DataTable,
    useBackendColumns,
    type BackendColumnsResponse,
} from "@workspace/flowtrove/components/data-table"
import { useMemo, useState } from "react"
import ContentLoader, { type BreadcrumbItem } from "@workspace/flowtrove/components/content-loader"
import {
    getSessionsColumns,
    getSessionsList,
    type Session,
    type SessionsListResponse,
} from "./api"
import { prependSessionColumns } from "./components/table-columns"

export const SESSIONS_FETCH_PERSISTENT = "account-sessions"

const breadcrumb: BreadcrumbItem[] = [
    { label: "Account", to: "/account" },
]

const SessionsPage = () => {
    const [currentSessionId, setCurrentSessionId] = useState<string | undefined>()

    const {
        columns,
        isLoading: columnsLoading,
        error,
        columnVisibility,
    } = useBackendColumns<Session>({
        fetchColumns: async () =>
            getSessionsColumns().then((res) => res.data as BackendColumnsResponse),
        queryKey: [SESSIONS_FETCH_PERSISTENT, "columns"],
        overrideColumns: prependSessionColumns(currentSessionId),
    })

    const fetchSessions = useMemo(
        () => async (state: unknown) => {
            const res = await getSessionsList(state)
            const body = res.data as SessionsListResponse
            setCurrentSessionId(body.current_session_id)
            return body
        },
        [],
    )

    return (
        <ContentLoader
            breadcrumb={breadcrumb}
            title="Active sessions"
            description="Devices and browsers where you are signed in. Revoke access you do not recognize."
            isLoading={columnsLoading}
            error={error}
            showHeaderSeparator
        >
            <DataTable<Session>
                columns={columns}
                source={{
                    type: "server",
                    options: {
                        fetch: fetchSessions,
                        queryKey: (state) => [SESSIONS_FETCH_PERSISTENT, "sessions", state],
                        initialPerPage: 10,
                    },
                }}
                initialState={{
                    sorting: [{ id: "created_at", desc: true }],
                    columnVisibility: {
                        ...columnVisibility,
                        method: false,
                    },
                }}
                getRowId={(row) => row.id}
                enableToolbar
                enableAdvancedFilter
                enablePagination
                rowIdKey="id"
            />
        </ContentLoader>
    )
}

export default SessionsPage
