import DynamicPage from "@/pages/dynamic"
import type { RouteObject } from "react-router"
import backendsSingleRoutes from "./pages/single/routes"
import { lazy } from "react"

const endpointsRoutes: RouteObject[] = [
    {
        index: true,
        Component: lazy(() => import("./pages/list").then(module => ({ default: module.default }))) ,
        // lazy: async () => {
        //     const m = await import("./pages/list")
        //     return { Component: m.default }
        // },
    },
    { path: ":backend_id", children: backendsSingleRoutes, },
    { path: "*", element: <DynamicPage /> },
]

export default endpointsRoutes