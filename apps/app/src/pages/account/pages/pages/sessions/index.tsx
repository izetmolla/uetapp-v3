import {
    DataTable,
    useBackendColumns,
    type BackendColumnsResponse,
} from "@workspace/flowtrove/components/data-table"
import { useMemo, useState } from "react"
import { withError } from "@workspace/flowtrove/lib/network"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import Loader from "@workspace/flowtrove/components/loader"
import {
    getSessionsColumns,
    getSessionsList,
    type Session,
    type SessionsListResponse,
} from "./api"
import { prependSessionColumns } from "./components/table-columns"

export const SESSIONS_FETCH_PERSISTENT = "account-sessions"

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

    if (columnsLoading) {
        return (
            <Card className="shadow-sm">
                <CardContent className="flex min-h-48 items-center justify-center py-12">
                    <Loader />
                </CardContent>
            </Card>
        )
    }

    if (withError(error, columns)) {
        return (
            <Card className="shadow-sm">
                <CardContent className="text-muted-foreground py-12 text-center text-sm">
                    Unable to load sessions. Please try again later.
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="shadow-sm">
            <CardHeader className="border-b pb-4">
                <CardTitle className="text-base font-semibold">Active sessions</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                    Review devices and browsers signed into your account. Sign out of any session you
                    do not recognize.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
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
            </CardContent>
        </Card>
    )
}

export default SessionsPage
