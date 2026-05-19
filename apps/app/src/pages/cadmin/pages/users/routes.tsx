import { Fragment } from "react/jsx-runtime"
import DynamicPage from "../../../dynamic"
import type { RouteObject } from "react-router"

const usersRoutes: RouteObject[] = [
    {
        index: true,
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/list")
            return { Component: m.default }
        },
    },
    {
        path: "enroll",
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/enroll")
            return { Component: m.default }
        },
    },
    {
        path: "roles",
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/roles")
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

export default usersRoutes
