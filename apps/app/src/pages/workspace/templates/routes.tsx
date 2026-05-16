import DynamicPage from "@/pages/dynamic"
import type { RouteObject } from "react-router"
import templatesSingleRoutes from "./pages/single/routes"

const templatesRoutes: RouteObject[] = [ 
    {
        index: true,
        // Component: lazy(() => import("./pages/list").then(module => ({ default: module.default }))) ,
        lazy: async () => {
            const m = await import("./pages/list")
            return { Component: m.default }
        },
    },
    { path: ":template_id", children: templatesSingleRoutes },
    { path: "*", element: <DynamicPage /> },
]

export default templatesRoutes