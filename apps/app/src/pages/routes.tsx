// import { Fragment } from "react/jsx-runtime"
import { createBrowserRouter } from "react-router"
import TemplateLayout, { AuthorizationLayout } from "../components/layout/layout"
// import Loader from "@workspace/flowtrove/components/loader"



import { Fragment } from "react/jsx-runtime"

import DynamicPage from "./dynamic"
import Dashboard from "./dashboard"


import workspaceRoutes from "./workspace/routes"
import WorkspaceLayout from "./workspace/layout"


// Authorization routes
import SignIn from "./authorization/pages/signin"
import Reset from "./authorization/pages/reset"


const ws_routes = [
    { index: true, element: <Dashboard /> },
    { path: ":ws", hydrateFallbackElement: <Fragment />, children: workspaceRoutes, element: <WorkspaceLayout /> },
    { path: "*", element: <DynamicPage /> },
]
const router = createBrowserRouter([
    { path: "/workspace", element: <TemplateLayout />, children: ws_routes },
    {
        path: "/",
        element: <AuthorizationLayout />,
        children: [
            { index: true, element: <DynamicPage /> },
            { path: "sign-in", element: <SignIn /> },
            { path: "reset-password", element: <Reset /> },
            { path: "*", element: <DynamicPage /> },
        ]
    }
])

export default router