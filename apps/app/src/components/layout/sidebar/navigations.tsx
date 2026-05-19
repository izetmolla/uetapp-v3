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
import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useState, type FC } from "react";
import { isNavItemActive, isNavTreeActive, type NavigationItem } from "./nav-utils";

export type { NavigationItem };

interface NavigationItemsProps {
    navigations: NavigationItem[];
}

const DEFAULT_PREFETCH = "render";

const menuButtonClassName =
    "hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10";

type NavCollapsibleProps = {
    item: NavigationItem;
    pathname: string;
    isMobile: boolean;
};

const NavCollapsible: FC<NavCollapsibleProps> = ({ item, pathname, isMobile }) => {
    const branchActive = isNavTreeActive(pathname, item);
    const [open, setOpen] = useState(branchActive);

    useEffect(() => {
        if (branchActive) setOpen(true);
    }, [branchActive]);

    return (
        <>
            <div className="hidden group-data-[collapsible=icon]:block">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            tooltip={item.title}
                            isActive={branchActive}
                            className={menuButtonClassName}>
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
                        {item.children?.map((subItem) => (
                            <DropdownMenuItem
                                className={cn(
                                    "hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10! active:bg-[var(--primary)]/10!",
                                    isNavItemActive(pathname, subItem.to) &&
                                        "bg-[var(--primary)]/10 text-foreground",
                                )}
                                asChild
                                key={subItem.title}>
                                <Link
                                    to={subItem.to}
                                    target={subItem.newTab ? "_blank" : ""}
                                    prefetch={subItem.prefetch ?? DEFAULT_PREFETCH}>
                                    {subItem.title}
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Collapsible
                open={open}
                onOpenChange={setOpen}
                className="group/collapsible block group-data-[collapsible=icon]:hidden">
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        className={menuButtonClassName}
                        isActive={branchActive}
                        tooltip={item.title}>
                        {item.icon && <Icon name={item.icon} />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.children?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                    className={menuButtonClassName}
                                    isActive={isNavItemActive(pathname, subItem.to)}
                                    asChild>
                                    <Link
                                        to={subItem.to}
                                        target={subItem.newTab ? "_blank" : ""}
                                        prefetch={subItem.prefetch ?? DEFAULT_PREFETCH}>
                                        <span>{subItem.title}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </>
    );
};

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
                                        <NavCollapsible item={item} pathname={pathname} isMobile={isMobile} />
                                    ) : (
                                        <SidebarMenuButton
                                            className={menuButtonClassName}
                                            isActive={isNavItemActive(pathname, item.to)}
                                            tooltip={item.title}
                                            asChild>
                                            <Link
                                                to={item.to}
                                                target={item.newTab ? "_blank" : ""}
                                                prefetch={item.prefetch ?? DEFAULT_PREFETCH}>
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
};
