import { Fragment } from "react/jsx-runtime"
import DynamicPage from "../../../dynamic"
import type { RouteObject } from "react-router"

const scandocumentsRoutes: RouteObject[] = [
    {
        index: true,
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/academicyears")
            return { Component: m.default }
        },
    },
    {
        path: ":year",
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/faculties")
            return { Component: m.default }
        },
    },
    {
        path: ":year/:faculty_slug",
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/studylevels")
            return { Component: m.default }
        },
    },
    {
        path: ":year/:faculty_slug/:group_id",
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/folders")
            return { Component: m.default }
        },
    },
    {
        path: ":year/:faculty_slug/:level/:folder_id",
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/students")
            return { Component: m.default }
        },
    },
    { path: "*", element: <DynamicPage /> },
]

export default scandocumentsRoutes
