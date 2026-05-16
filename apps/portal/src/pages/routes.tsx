import { createBrowserRouter } from "react-router"
import { AuthorizationLayout, Layout } from "./layout"
import DynamicPage from "./dynamicpage"
import SignIn from "./authorization/pages/signin"
import Register from "./authorization/pages/register"
import Reset from "./authorization/pages/reset"
import Home from "./home"



export default createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: "*", element: <DynamicPage /> },
        ]
    },
    {
        path: "/",
        element: <AuthorizationLayout />,
        children: [
            { index: true, element: <DynamicPage /> },
            { path: "sign-in", element: <SignIn /> },
            { path: "register", element: <Register /> },
            { path: "reset-password", element: <Reset /> },
            { path: "*", element: <DynamicPage /> },
        ]
    }
])