import DynamicPage from "@/pages/dynamic"
import type { RouteObject } from "react-router"
import workflowsSingleRoutes from "./pages/single/routes"
import { lazy } from "react"
import WorkflowsLayout from "./layout"
import SingleWorkflowsLayout from "./pages/single/layout"

const workflowsRoutes: RouteObject[] = [
    {
        Component: WorkflowsLayout,
        children: [
            {
                index: true,
                Component: lazy(() => import("./pages/list").then((module) => ({ default: module.default }))),
            },
            { path: ":workflow_id", Component: lazy(() => import("./pages/workflow").then((module) => ({ default: module.default }))), },
            { path: "workflow", element: <SingleWorkflowsLayout />, children: workflowsSingleRoutes },
            { path: "*", element: <DynamicPage /> },
        ],
    },
]

export default workflowsRoutes