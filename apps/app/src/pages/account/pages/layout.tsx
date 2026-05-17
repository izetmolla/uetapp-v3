import { Lock, MapPin, MoreHorizontal, Pencil, Shield, User, Users } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { ProfileHeader } from "./components/profile-header";
import { ProfileSidebar } from "./components/profile-sidebar";

const accountNav = [
    {
        to: "/account",
        label: "General",
        description: "Profile and personal details",
        icon: User,
        end: true,
    },
    {
        to: "/account/security",
        label: "Password & Security",
        description: "Password and security settings",
        icon: Lock,
        end: true,
    },
    {
        to: "/account/address",
        label: "Addresses",
        description: "Addresses and contact information",
        icon: MapPin,
        end: true,
    },
    {
        to: "/account/roles",
        label: "Roles",
        description: "Roles and permissions",
        icon: Users,
        end: true,
    },
    {
        to: "/account/sessions",
        label: "Sessions",
        description: "Sessions and sign-in activity",
        icon: Shield,
        end: false,
    },
] as const;

function AccountNavLink({
    to,
    label,
    icon: Icon,
    end,
}: (typeof accountNav)[number]) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                cn(
                    "relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-1 py-3.5 text-sm font-medium transition-colors",
                    "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
                    isActive
                        ? "text-foreground after:bg-primary"
                        : "text-muted-foreground hover:text-foreground after:bg-transparent"
                )
            }
        >
            <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
            {label}
        </NavLink>
    );
}

const AccountLayout = () => {
    const { pathname } = useLocation();
    const isSessionsView = pathname.includes("/sessions");
    const isOverview = !isSessionsView;

    return (
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-2 sm:px-6 lg:px-8 lg:pt-4">
            <header className="mb-6 sm:mb-8">
                <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Account</h1>
                <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm leading-relaxed">
                    Manage your profile, security settings, and how you appear across the platform.
                </p>
            </header>

            <div className="space-y-6 lg:space-y-8 [--account-nav-height:3.5rem]">
                <div className="overflow-hidden rounded-t-xl border border-b-0 bg-card shadow-sm">
                    <ProfileHeader />
                </div>

                <div
                    className="sticky top-(--header-height) z-40 -mt-6 min-h-(--account-nav-height) rounded-b-xl border bg-card shadow-sm supports-[backdrop-filter]:bg-card/95 supports-[backdrop-filter]:backdrop-blur-md lg:-mt-8"
                    data-account-nav
                >
                    <div className="flex min-w-0 items-center gap-2 px-4 py-1.5 sm:justify-between sm:px-6">
                        <nav
                            className="-mb-px flex min-w-0 flex-1 flex-nowrap gap-4 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-7 [&::-webkit-scrollbar]:hidden"
                            aria-label="Account sections"
                        >
                            {accountNav.map((item) => (
                                <AccountNavLink key={item.to} {...item} />
                            ))}
                        </nav>

                        <div className="flex shrink-0 items-center gap-1.5">
                            {isOverview ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="size-8 shrink-0 gap-0 px-0 sm:h-8 sm:w-auto sm:gap-1.5 sm:px-2.5"
                                    aria-label="Edit profile"
                                >
                                    <Pencil className="size-3.5" />
                                    <span className="hidden sm:inline">Edit profile</span>
                                </Button>
                            ) : null}
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground size-8"
                                aria-label="More options"
                            >
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div
                    className={cn(
                        "gap-6 lg:gap-8",
                        isOverview
                            ? "lg:grid lg:grid-cols-[minmax(0,280px)_1fr] xl:grid-cols-[minmax(0,300px)_1fr]"
                            : "block"
                    )}
                >
                    {isOverview ? <ProfileSidebar /> : null}

                    <main className="min-w-0 space-y-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AccountLayout;
