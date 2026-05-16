import DynamicPage from "../dynamic"
import type { RouteObject } from "react-router"
import suplementsRoutes from "./pages/suplements/routes"
import { Fragment } from "react/jsx-runtime"

const secretaryRoutes: RouteObject[] = [
    {
        index: true,
        lazy: async () => {
            const m = await import("./pages/dashboard")
            return { Component: m.default }
        },
    },
    { path: "suplements", hydrateFallbackElement: <Fragment />, children: suplementsRoutes },
    { path: "*", element: <DynamicPage /> },
]

export default secretaryRoutes
