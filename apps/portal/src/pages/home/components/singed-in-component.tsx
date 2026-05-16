import { Button } from "@workspace/ui/components/button";
import { Link } from "react-router";
import {
    ArrowRight,
    BadgeCheck,
    Bell,
    ChevronRightIcon,
    CreditCard,
    LayoutDashboard,
    LogOut,
    ShieldCog,
    Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@workspace/ui/components/dropdown-menu";
import { Progress } from "@workspace/ui/components/progress";
import useAuthorizationStore, { useSignOutApi } from "@workspace/flowtrove/store/authorization";
import { generateAvatarFallback } from "@workspace/ui/lib/utils";


const SignedInComponent = () => {
    const user = useAuthorizationStore(c => c.user);
    const signOut = useAuthorizationStore(c => c.signOut);
    const fullName = `${user?.first_name} ${user?.last_name}`
    const handleLogout = () => {
        signOut()
        useSignOutApi()
    }
    return (
        <>
            <Button
                variant="outline"
                onClick={() => window.location.href = '/workspace'}
                className="h-8 gap-2 border-hairline bg-background/70 pr-2 pl-1.5 text-foreground shadow-sm backdrop-blur-sm transition-[border-color,box-shadow,transform,background-color] hover:border-indigo-accent/35 hover:bg-surface-2 hover:shadow-[0_0_28px_-10px] hover:shadow-indigo-accent/30 dark:bg-surface-2/35 dark:hover:border-cyan-accent/40 dark:hover:bg-surface-2/80 dark:hover:shadow-[0_0_28px_-10px] dark:hover:shadow-cyan-accent/25"
            >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-brand text-white shadow-brand-glow">
                    <LayoutDashboard className="size-3.5" aria-hidden />
                </span>
                <span className="text-sm font-medium tracking-tight">My Workspace</span>
                <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover/button:translate-x-0.5 group-hover/button:text-foreground" aria-hidden />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                        <AvatarImage src={user?.avatar_url} alt={fullName} />
                        <AvatarFallback className="rounded-lg">{generateAvatarFallback(fullName)}</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-60" align="end">
                    <DropdownMenuLabel className="p-0">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar>
                                <AvatarImage src={user?.avatar_url} alt={fullName} />
                                <AvatarFallback className="rounded-lg">{generateAvatarFallback(fullName)}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{fullName}</span>
                                <span className="text-muted-foreground truncate text-xs">{user?.email}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link to="https://www.flowtrove.com/pricing" target="_blank">
                                <Sparkles /> Upgrade to Pro
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <BadgeCheck />
                            Account
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <CreditCard />
                            Billing
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Bell />
                            Notifications
                        </DropdownMenuItem>
                        {user?.roles.includes('admin:rw') && (
                            <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = '/cadmin'}>
                                <ShieldCog />
                                CAdmin
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut />
                        Log out
                    </DropdownMenuItem>
                    <div className="bg-muted mt-1.5 rounded-md border">
                        <div className="space-y-3 p-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">Credits</h4>
                                <div className="text-muted-foreground flex cursor-pointer items-center text-sm">
                                    <span>5 left</span>
                                    <ChevronRightIcon className="ml-1 h-4 w-4" />
                                </div>
                            </div>
                            <Progress value={40} className="bg-primary" />
                            <div className="text-muted-foreground flex items-center text-sm">
                                Daily credits used first
                            </div>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

export default SignedInComponent;