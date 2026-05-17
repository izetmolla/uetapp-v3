import DynamicPage from "../dynamic"
import { type RouteObject } from "react-router"
import Loader from "@workspace/flowtrove/components/loader"

const accountRoutes: RouteObject[] = [
    {
        index: true,
        hydrateFallbackElement: <Loader fullScreen />,
        lazy: () => import("./pages/profile").then((m) => ({ Component: m.default })),
    },
    {
        path: "sessions",
        hydrateFallbackElement: <Loader fullScreen />,
        lazy: () => import("./pages/sessions").then((m) => ({ Component: m.default })),
    },
    { path: "*", element: <DynamicPage /> },
]

export default accountRoutes
