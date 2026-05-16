"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Separator } from "@workspace/ui/components/separator";
import Notifications from "./notifications";
import Search from "./search";
import ThemeSwitch from "./theme-switch";
import { ThemeCustomizerPanel } from "@workspace/flowtrove/components/theme-customizer";
import { Button } from "@workspace/ui/components/button";
import { useSidebar } from "@workspace/ui/components/sidebar";
import { Link } from "react-router";
import UserMenu from "./user-menu";

export function SiteHeader() {
  const { toggleSidebar, open } = useSidebar();

  return (
    <header className="bg-background/40 sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 overflow-hidden border-b backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) md:rounded-tl-xl md:rounded-tr-xl">
      {/* <div //tiny shine
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-9 w-8 bg-[radial-gradient(circle_at_top_left,oklch(1_0_0_/_0.34),transparent_98%)] dark:bg-[radial-gradient(circle_at_top_left,oklch(1_0_0_/_0.12),transparent_98%)]"
      /> */}
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
        <Button onClick={toggleSidebar} size="icon" variant="ghost">
          {open ? <PanelLeftClose /> : <PanelLeftOpen />}
        </Button>
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center" />
        <Search />

        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="link"
            className="relative animate-pulse bg-linear-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text font-medium text-transparent hover:bg-transparent"
            asChild>
            <Link to="https://shadcnuikit.com/pricing" target="_blank">
              Get Pro
            </Link>
          </Button>
          <Notifications />
          <ThemeSwitch />
          <ThemeCustomizerPanel />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center" />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
