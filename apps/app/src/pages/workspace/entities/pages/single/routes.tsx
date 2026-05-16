import DynamicPage from "@/pages/dynamic"
import type { RouteObject } from "react-router"

const entitiesSingleRoutes: RouteObject[] = [
    {
        index: true,
        lazy: async () => {
            const m = await import("./pages/content")
            return { Component: m.default }
        },
    },
    { path: "schema", lazy: async () => {
        const m = await import("./pages/schema")
        return { Component: m.default }
    } },
    { path: "*", element: <DynamicPage /> },
]

export default entitiesSingleRoutes