import React from "react";

import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar";
import { AppSidebar } from "./sidebar/app-sidebar";
import { SiteHeader } from "./header";
import { Outlet } from "react-router";
import useAuthorizationStore from "@workspace/flowtrove/store/authorization";

const Layout = () => {
    const defaultOpen = true;
    const isSignedIn = useAuthorizationStore(x => x.isSignedIn)

    if (!isSignedIn) {
        window.location.replace(`/sign-in?redirectUrl=${encodeURIComponent(window.location.href)}`)
        return null
    }

    return (
        <SidebarProvider
            defaultOpen={defaultOpen}
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 64)",
                    "--header-height": "calc(var(--spacing) * 14)",
                    "--content-padding": "calc(var(--spacing) * 4)",
                    "--content-margin": "calc(var(--spacing) * 1.5)",
                    "--content-full-height":
                        "calc(100vh - var(--header-height) - (var(--content-padding) * 2) - (var(--content-margin) * 2))"
                } as React.CSSProperties
            }>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="bg-muted/40 flex flex-1 flex-col">
                    <div className="@container/main p-(--content-padding) xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
                        <Outlet />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}



export const AuthorizationLayout = () => {
    return (
        <Outlet />
    )
}
export default Layout
