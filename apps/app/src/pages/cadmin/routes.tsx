import DynamicPage from "../dynamic"
import { type RouteObject } from "react-router"
import usersRoutes from "./pages/users/routes"
import orgUnitsRoutes from "./pages/orgunits/routes"
import resourcesRoutes from "./pages/resources/routes"
import Loader from "@workspace/flowtrove/components/loader"

const cadminRoutes: RouteObject[] = [
    {
        index: true,
        hydrateFallbackElement: <Loader fullScreen />,
        lazy: () => import("./pages/dashboard").then((m) => ({ Component: m.default })),
    },
    { path: "users", hydrateFallbackElement: <Loader fullScreen />, children: usersRoutes },
    { path: "orgunits", hydrateFallbackElement: <Loader fullScreen />, children: orgUnitsRoutes },
    { path: "resources", hydrateFallbackElement: <Loader fullScreen />, children: resourcesRoutes },
    { path: "*", element: <DynamicPage /> },
]

export default cadminRoutes
