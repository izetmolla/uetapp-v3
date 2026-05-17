import DynamicPage from "../dynamic"
import { type RouteObject } from "react-router"
import usersRoutes from "./pages/users/routes"
import { Fragment } from "react/jsx-runtime"

const cadminRoutes: RouteObject[] = [
    {
        index: true,
        hydrateFallbackElement: <Fragment />,
        lazy: () => import("./pages/dashboard").then((m) => ({ Component: m.default })),
    },
    { path: "users", hydrateFallbackElement: <Fragment />, children: usersRoutes },
    { path: "*", element: <DynamicPage /> },
]

export default cadminRoutes
