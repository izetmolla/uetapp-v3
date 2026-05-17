import DynamicPage from "../dynamic"
import { Navigate, type RouteObject } from "react-router"
import suplementsRoutes from "./pages/suplements/routes"
import { Fragment } from "react/jsx-runtime"

const secretaryRoutes: RouteObject[] = [
    { index: true, element: <Navigate to="/secretary/suplements" /> },
    { path: "suplements", hydrateFallbackElement: <Fragment />, children: suplementsRoutes },
    { path: "*", element: <DynamicPage /> },
]

export default secretaryRoutes
