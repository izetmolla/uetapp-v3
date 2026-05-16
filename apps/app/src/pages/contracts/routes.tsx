import DynamicPage from "../dynamic"
import type { RouteObject } from "react-router"
import { Fragment } from "react/jsx-runtime"
import scandocumentsRoutes from "./pages/scandocuments/routes"
import studentsRoutes from "./pages/students/routes"

const contractsRoutes: RouteObject[] = [
    {
        index: true,
        lazy: async () => {
            const m = await import("./pages/dashboard")
            return { Component: m.default }
        },
    },
    { path: "scandocuments", hydrateFallbackElement: <Fragment />, children: scandocumentsRoutes },
    { path: "students", hydrateFallbackElement: <Fragment />, children: studentsRoutes },
    { path: "*", element: <DynamicPage /> },
]

export default contractsRoutes
