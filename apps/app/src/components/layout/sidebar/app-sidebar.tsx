"use client";

import * as React from "react";
import { useEffect } from "react";
import { useIsTablet } from "@/hooks/use-mobile";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar
} from "@workspace/ui/components/sidebar";
import { NavUser } from "./nav-user";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

import {
  useLocation,
} from "react-router";
import { getGeneralData, type GeneralDataTypes } from "./api";
import { useQuery } from "@tanstack/react-query";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { withError, withInitialData, withService } from "@workspace/flowtrove/lib/network";
import { NavigationItems } from "./navigations";
import ServiceSwitcher from "./sidebarheader";
import ServiceHeader from "./sidebarheader/service-header";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { service } = withService()
  const { isLoading, error, data } = useQuery({
    queryKey: ["general-data", service],
    queryFn: () => getGeneralData(),
    ...withInitialData<GeneralDataTypes>("general"),
  });
  console.log("data", service)
  const { pathname } = useLocation();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const isTablet = useIsTablet();

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname]);

  useEffect(() => {
    setOpen(!isTablet);
  }, [isTablet]);


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-0 p-0">
        <ContentLoader isLoading={isLoading} error={withError(error, data)} minimalError>
          {data?.service?.id && data?.service?.name != "app" ? (
            <ServiceHeader service={data?.service} />
          ) : (
            <ServiceSwitcher services={data?.services ?? []} />
          )}
        </ContentLoader>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <ContentLoader isLoading={isLoading} error={withError(error, data)} minimalError>
            <NavigationItems navigations={data?.navigations ?? []} />
          </ContentLoader>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        {/* <Card className="gap-4 overflow-hidden py-4 group-data-[collapsible=icon]:hidden">
          <CardHeader className="px-3">
            <CardTitle>Unlock Everything</CardTitle>
            <CardDescription>
              Get instant access to all premium dashboards, templates, and UI components. Pay once,
              use forever in unlimited projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3">
            <Button className="w-full" asChild>
              <Link to="https://shadcnuikit.com/pricing" target="_blank">
                <span className="size-2 shrink-0 rounded-full bg-green-500"></span>
                Get Full Access
              </Link>
            </Button>
          </CardContent>
        </Card> */}
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
