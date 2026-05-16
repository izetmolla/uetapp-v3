"use client"
import {
    ChevronsUpDown,
    // Plus
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    // DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@workspace/ui/components/sidebar"
import Icon from "@workspace/ui/components/icon"
import { useNavigate } from "react-router"
import Logo from "../../logo"

export function ServiceSwitcher({
    services,
}: {
    services: {
        id: string
        title: string
        description: string
        icon?: string
        name: string
    }[];
}) {
    const navigate = useNavigate()
    const { isMobile } = useSidebar()
    const stopLogoEvent = (e: React.MouseEvent<HTMLImageElement> | React.PointerEvent<HTMLImageElement>) => {
        e.stopPropagation();
    };
    const onLogoClick = (e: React.MouseEvent<HTMLImageElement>) => {
        e.stopPropagation();
        navigate("/");
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <Logo onClick={onLogoClick} onPointerDown={stopLogoEvent} />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">UET App Workspace</span>
                                <span className="truncate text-xs">Your university management system</span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Services
                        </DropdownMenuLabel>
                        {services?.map((service, index) => (
                            <DropdownMenuItem
                                key={service.id}
                                onClick={() => navigate(`/${service.name}`)}
                                className="gap-2 p-2 cursor-pointer"
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border">
                                    <Icon name={service.icon ?? ""} className="size-3.5 shrink-0" />
                                </div>
                                {service.title}
                                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                        {/* <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2 cursor-pointer" onClick={() => navigate("/")}>
                            <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                <Plus className="size-4" />
                            </div>
                            <div className="font-medium text-muted-foreground">Create workspace</div>
                        </DropdownMenuItem> */}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

export default ServiceSwitcher;