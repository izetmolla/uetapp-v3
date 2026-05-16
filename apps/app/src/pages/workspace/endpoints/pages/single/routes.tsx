import DynamicPage from "@/pages/dynamic"
import type { RouteObject } from "react-router"

const endpointsSingleRoutes: RouteObject[] = [
    {
        index: true,
        lazy: async () => {
            const m = await import("./pages/general")
            return { Component: m.default }
        },
    },
    { path: "*", element: <DynamicPage /> },
]

export default endpointsSingleRoutes