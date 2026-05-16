import DynamicPage from "@/pages/dynamic"
import type { RouteObject } from "react-router"
import domainsSingleRoutes from "./pages/single/routes"
import { lazy } from "react"

const domainsRoutes: RouteObject[] = [
    {
        index: true,
        Component: lazy(() => import("./pages/list").then(module => ({ default: module.default }))) ,
        // lazy: async () => {
        //     const m = await import("./pages/list")
        //     return { Component: m.default }
        // },
    },
    { path: ":domain_id", children: domainsSingleRoutes, },
    { path: "*", element: <DynamicPage /> },
]

export default domainsRoutes