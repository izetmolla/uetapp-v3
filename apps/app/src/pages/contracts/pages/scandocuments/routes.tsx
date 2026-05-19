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
        path: ":year/:facultySlug",
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/studylevels")
            return { Component: m.default }
        },
    },
    {
        path: ":year/:facultySlug/:level",
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/folders")
            return { Component: m.default }
        },
    },
    {
        path: ":year/:facultySlug/:level/:folderId",
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/students")
            return { Component: m.default }
        },
    },
    {
        path: ":year/:facultySlug/:level/:folderId/:studentId",
        hydrateFallbackElement: <Fragment />,
        lazy: async () => {
            const m = await import("./pages/single")
            return { Component: m.default }
        },
    },
    { path: "*", element: <DynamicPage /> },
]

export default scandocumentsRoutes
