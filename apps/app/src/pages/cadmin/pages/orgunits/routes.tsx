import { Fragment } from "react/jsx-runtime"
import DynamicPage from "../../../dynamic"
import type { RouteObject } from "react-router"

const orgUnitsRoutes: RouteObject[] = [
    {
        index: true,
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/list")
            return { Component: m.default }
        },
    },
    {
        path: "academicyears",
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/academicyears")
            return { Component: m.default }
        },
    },
    {
        path: "faculties",
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/faculties")
            return { Component: m.default }
        },
    },
    {
        path: "departments",
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/departments")
            return { Component: m.default }
        },
    },
    {
        path: "studylevels",
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/studylevels")
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

export default orgUnitsRoutes
