import DynamicPage from "../dynamic"
import { type RouteObject } from "react-router"
import Loader from "@workspace/flowtrove/components/loader"
import AccountLayout from "./pages/layout"

const accountRoutes: RouteObject[] = [
    {
        path: "*",
        element: <AccountLayout />,
        children: [
            {
                index: true,
                hydrateFallbackElement: <Loader fullScreen />,
                lazy: () => import("./pages/pages/profile").then((m) => ({ Component: m.default })),
            },
            {
                path: "sessions",
                hydrateFallbackElement: <Loader fullScreen />,
                lazy: () => import("./pages/pages/sessions").then((m) => ({ Component: m.default })),
            },
            { path: "*", element: <DynamicPage /> },
        ],
    }
]

export default accountRoutes
