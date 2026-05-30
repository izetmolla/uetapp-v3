import DynamicPage from "../dynamic"
import type { RouteObject } from "react-router"
import { Fragment } from "react/jsx-runtime"

const lbRoutes: RouteObject[] = [
    {
        index: true,
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/index")
            return { Component: m.default }
        },
    },
    { path: "*", element: <DynamicPage /> },
]

export default lbRoutes
