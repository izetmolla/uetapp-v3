// import { Fragment } from "react/jsx-runtime"
import { createBrowserRouter } from "react-router"
import TemplateLayout, { AuthorizationLayout } from "../components/layout/layout"
import Loader from "@workspace/flowtrove/components/loader"



// import { Fragment } from "react/jsx-runtime"

import DynamicPage from "./dynamic"
import Dashboard from "./dashboard"


import secretaryRoutes from "./secretary/routes"
import contractsRoutes from "./contracts/routes"
import accountRoutes from "./account/routes"

// Authorization routes
import SignIn from "./authorization/pages/signin"
import Reset from "./authorization/pages/reset"
import cadminRoutes from "./cadmin/routes"
import Unauthorized401 from "../components/errors/401"





const router = createBrowserRouter([
    {
        path: "/", element: <TemplateLayout />, children: [
            { index: true, element: <Dashboard /> },
            { path: "unauthorized", element: <Unauthorized401 /> },
            { path: "*", element: <DynamicPage /> },
            { path: "account", hydrateFallbackElement: <Loader fullScreen />, children: accountRoutes },
            { path: "cadmin", hydrateFallbackElement: <Loader fullScreen />, children: cadminRoutes },
            { path: "secretary", hydrateFallbackElement: <Loader fullScreen />, children: secretaryRoutes },
            { path: "contracts", hydrateFallbackElement: <Loader fullScreen />, children: contractsRoutes },
        ]
    },
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