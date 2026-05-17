import {
  Bell,
  LogOut,
  User,
  Monitor,
  Moon,
  Palette,
  Settings,
  ShieldCog,
  Sun,
  UserRound,
} from "lucide-react";

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
import { Link } from "react-router";
import { useTheme, type Theme } from "@workspace/flowtrove/components/providers/theme-provider";
import useAuthorizationStore, { useSignOutApi } from "@workspace/flowtrove/store/authorization";
import { generateAvatarFallback } from "@workspace/ui/lib/utils";

export default function UserMenu() {
  const { user, signOut } = useAuthorizationStore()
  const { theme, setTheme } = useTheme()
  const fullName = `${user?.first_name} ${user?.last_name}`

  const handleLogout = () => {
    signOut()
    void useSignOutApi()
    window.location.replace("/sign-in")
  }

  const handleSwitchAccount = () => {
    signOut()
    void useSignOutApi()
    const returnTo = `${window.location.pathname}${window.location.search}`
    window.location.replace(`/sign-in?redirectUrl=${encodeURIComponent(returnTo)}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
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
          {user?.roles.includes('admin:rw') && (
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link to="/cadmin">
                <ShieldCog />
                CAdmin
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
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
  );
}
