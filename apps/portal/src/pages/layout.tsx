import { Outlet } from "react-router"



const Layout = () => {
    return (
        <Outlet />
    )
}


const AuthorizationLayout = () => {
    return (
        <Outlet />
    )
}


export { Layout, AuthorizationLayout }