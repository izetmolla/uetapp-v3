import type { RouteObject } from "react-router"
import { lazy, Fragment } from "react"

import entitiesRoutes from "./entities/routes"
import workflowsRoutes from "./workflows/routes"
import endpointsRoutes from "./endpoints/routes"
import mcpRoutes from "./mcp/routes"
import templatesRoutes from "./templates/routes"
import domainsRoutes from "./domains/routes"
import developmentRoutes from "./development/routes"



const workspaceRoutes: RouteObject[] = [
    { index: true, Component: lazy(() => import("./dashboard").then(module => ({ default: module.default }))), },
    { path: "entities", hydrateFallbackElement: <Fragment />, children: entitiesRoutes, },
    { path: "domains", hydrateFallbackElement: <Fragment />, children: domainsRoutes, },
    { path: "workflows", hydrateFallbackElement: <Fragment />, children: workflowsRoutes, },
    { path: "endpoints", hydrateFallbackElement: <Fragment />, children: endpointsRoutes, },
    { path: "mcp", hydrateFallbackElement: <Fragment />, children: mcpRoutes, },
    { path: "templates", hydrateFallbackElement: <Fragment />, children: templatesRoutes, },
    { path: "development", hydrateFallbackElement: <Fragment />, children: developmentRoutes, },
]

export default workspaceRoutes