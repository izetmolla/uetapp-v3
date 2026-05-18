import { Fragment } from "react/jsx-runtime"
import DynamicPage from "../../../dynamic"
import type { RouteObject } from "react-router"

const orgUnitsRoutes: RouteObject[] = [
    {
        index: true,
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/list")
            return { Component: m.default }
        },
    },
    {
        path: ":id",
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/single")
            return { Component: m.default }
        },
    },
    { path: "*", element: <DynamicPage /> },
]

export default orgUnitsRoutes
