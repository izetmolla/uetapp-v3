"use client";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar
} from "@workspace/ui/components/sidebar";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@workspace/ui/components/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@workspace/ui/components/dropdown-menu";
import { Link, useLocation } from "react-router";
import Icon from "@workspace/ui/components/icon";
import type { FC } from "react";


export type NavigationItem = {
    title: string;
    to: string;
    icon?: string;
    isExternal?: boolean;
    isComing?: boolean;
    isDataBadge?: string;
    isNew?: boolean;
    newTab?: boolean;
    prefetch?: "none" | "render" | "intent";
    /** Role names required to see this item (enforced server-side; empty = public). */
    roles?: string[];
    children?: NavigationItem[];
};


interface NavigationItemsProps {
    navigations: NavigationItem[];
}

const DEFAULT_PREFETCH = "render";

export const NavigationItems: FC<NavigationItemsProps> = ({ navigations }) => {
    const { pathname } = useLocation();
    const { isMobile } = useSidebar();

    return (
        <>
            {navigations.map((nav) => (
                <SidebarGroup key={nav.title}>
                    <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>
                    <SidebarGroupContent className="flex flex-col gap-2">
                        <SidebarMenu>
                            {nav?.children?.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    {Array.isArray(item.children) && item.children.length > 0 ? (
                                        <>
                                            <div className="hidden group-data-[collapsible=icon]:block">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <SidebarMenuButton tooltip={item.title}>
                                                            {item.icon && <Icon name={item.icon} />}
                                                            <span>{item.title}</span>
                                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                        </SidebarMenuButton>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        side={isMobile ? "bottom" : "right"}
                                                        align={isMobile ? "end" : "start"}
                                                        className="min-w-48 rounded-lg">
                                                        <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                                                        {item.children?.map((item) => (
                                                            <DropdownMenuItem
                                                                className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10! active:bg-[var(--primary)]/10!"
                                                                asChild
                                                                key={item.title}>
                                                                <Link to={item.to} target={item.newTab ? "_blank" : ""} prefetch={item.prefetch ?? DEFAULT_PREFETCH}>{item.title}</Link>
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <Collapsible
                                                className="group/collapsible block group-data-[collapsible=icon]:hidden"
                                                defaultOpen={!!item.children?.find((s) => s.to === pathname)}>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton
                                                        className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                                                        tooltip={item.title}>
                                                        {item.icon && <Icon name={item.icon} />}
                                                        <span>{item.title}</span>
                                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item?.children?.map((subItem, key) => (
                                                            <SidebarMenuSubItem key={key}>
                                                                <SidebarMenuSubButton
                                                                    className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                                                                    isActive={pathname === subItem.to}
                                                                    asChild>
                                                                    <Link to={subItem.to} target={subItem.newTab ? "_blank" : ""} prefetch={subItem.prefetch ?? DEFAULT_PREFETCH}>
                                                                        <span>{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </>
                                    ) : (
                                        <SidebarMenuButton
                                            className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                                            isActive={pathname === item.to}
                                            tooltip={item.title}
                                            asChild>
                                            <Link to={item.to} target={item.newTab ? "_blank" : ""} prefetch={item.prefetch ?? DEFAULT_PREFETCH}>
                                                {item.icon && <Icon name={item.icon} />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    )}
                                    {!!item.isComing && (
                                        <SidebarMenuBadge className="peer-hover/menu-button:text-foreground opacity-50">
                                            Coming
                                        </SidebarMenuBadge>
                                    )}
                                    {!!item.isNew && (
                                        <SidebarMenuBadge className="border border-green-400 text-green-600 peer-hover/menu-button:text-green-600">
                                            New
                                        </SidebarMenuBadge>
                                    )}
                                    {!!item.isDataBadge && (
                                        <SidebarMenuBadge className="peer-hover/menu-button:text-foreground">
                                            {item.isDataBadge}
                                        </SidebarMenuBadge>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
        </>
    );
}
