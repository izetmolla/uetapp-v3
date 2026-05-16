import DynamicPage from "@/pages/dynamic"
import type { RouteObject } from "react-router"
import entitiesSingleRoutes from "./pages/single/routes"
import { lazy } from "react"

const entitiesRoutes: RouteObject[] = [
    {
        index: true,
        Component: lazy(() => import("./pages/list").then(module => ({ default: module.default }))) ,
        // lazy: async () => {
        //     const m = await import("./pages/list")
        //     return { Component: m.default }
        // },
    },
    { path: ":entity_id", children: entitiesSingleRoutes, },
    { path: "*", element: <DynamicPage /> },
]

export default entitiesRoutes