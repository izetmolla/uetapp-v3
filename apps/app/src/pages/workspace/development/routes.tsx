import type { RouteObject } from "react-router"
import { lazy } from "react"
import DevelopmentLayout from "./pages/layout"

const backendsRoutes: RouteObject[] = [
    {
        path: "*",
        element: <DevelopmentLayout />,
        children: [
            { index: true, Component: lazy(() => import("./pages/editor").then(module => ({ default: module.default }))), },
        ]
    },
]

export default backendsRoutes