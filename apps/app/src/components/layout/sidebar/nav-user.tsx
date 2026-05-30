"use client";

import {
    Bell,
    LogOut,
    Monitor,
    Moon,
    Palette,
    Settings,
    ShieldCog,
    Sun,
    User,
    UserRound,
} from "lucide-react";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { Link } from "react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@workspace/ui/components/sidebar";
import { useTheme, type Theme } from "@workspace/flowtrove/components/providers/theme-provider";
import useAuthorizationStore, {
    getSignedInSessions,
    useSignOutApi,
} from "@workspace/flowtrove/store/authorization";
import { generateAvatarFallback } from "@workspace/ui/lib/utils";

export function NavUser() {
    const { user, signOut, setCurrentSession } = useAuthorizationStore();
    const authState = useAuthorizationStore();
    const { theme, setTheme } = useTheme();
    const fullName = `${user?.first_name} ${user?.last_name}`;
    const { isMobile } = useSidebar();
    const otherSignedInSessions = getSignedInSessions(authState);

    const handleLogout = () => {
        signOut();
        void useSignOutApi();
        window.location.replace("/sign-in");
    };

    const handleSwitchAccount = () => {
        const returnTo = `${window.location.pathname}${window.location.search}`;
        window.location.replace(`/sign-in?redirectUrl=${encodeURIComponent(returnTo)}`);
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                        >
                            <Avatar className="rounded-full">
                                <AvatarImage src={user?.avatar_url} alt={fullName} />
                                <AvatarFallback className="rounded-lg">
                                    {generateAvatarFallback(fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{fullName}</span>
                                <span className="text-muted-foreground truncate text-xs">{user?.email}</span>
                            </div>
                            <DotsVerticalIcon className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user?.avatar_url} alt={fullName} />
                                    <AvatarFallback className="rounded-lg">
                                        {generateAvatarFallback(fullName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{fullName}</span>
                                    <span className="text-muted-foreground truncate text-xs">{user?.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link to="/account">
                                    <User />
                                    My Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link to="/notifications">
                                    <Bell />
                                    Notifications
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link to="/settings">
                                    <Settings />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <Palette className="size-3.5 opacity-70" />
                                    Apparence
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent side="left" align="start" className="min-w-36 cursor-pointer">
                                    <DropdownMenuRadioGroup
                                        value={theme}
                                        onValueChange={(value) => setTheme(value as Theme)}
                                    >
                                        <DropdownMenuRadioItem value="light">
                                            <Sun className="size-3.5 opacity-70" />
                                            Light
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="dark">
                                            <Moon className="size-3.5 opacity-70" />
                                            Dark
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="system">
                                            <Monitor className="size-3.5 opacity-70" />
                                            System
                                        </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            {user?.roles?.includes("admin:rw") && (
                                <DropdownMenuItem className="cursor-pointer" asChild>
                                    <Link to="/cadmin">
                                        <ShieldCog />
                                        CAdmin
                                    </Link>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuGroup>
                        {otherSignedInSessions.length > 0 ? (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-muted-foreground text-xs">
                                    Switch account
                                </DropdownMenuLabel>
                                {otherSignedInSessions.map((session) => {
                                    const name = [session.user.first_name, session.user.last_name]
                                        .filter(Boolean)
                                        .join(" ")
                                        .trim();
                                    return (
                                        <DropdownMenuItem
                                            key={session.id}
                                            className="cursor-pointer"
                                            onClick={() => setCurrentSession(session.id)}
                                        >
                                            <UserRound className="size-3.5 opacity-70" />
                                            <span className="truncate">
                                                {name || session.user.email}
                                            </span>
                                        </DropdownMenuItem>
                                    );
                                })}
                            </>
                        ) : null}
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                            <LogOut className="size-3.5 opacity-70" />
                            Log out
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSwitchAccount} className="cursor-pointer text-xs">
                            <UserRound className="size-3.5 opacity-70" />
                            Switch account
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
