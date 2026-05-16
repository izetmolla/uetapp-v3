"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Separator } from "@workspace/ui/components/separator";
import Notifications from "./notifications";
import { SearchProvider, SearchDesktop, SearchMobileTrigger } from "./search";
import ThemeSwitch from "./theme-switch";
import { ThemeCustomizerPanel } from "@workspace/flowtrove/components/theme-customizer";
import { Button } from "@workspace/ui/components/button";
import { useSidebar } from "@workspace/ui/components/sidebar";
// import { Link } from "react-router";
import UserMenu from "./user-menu";

export function SiteHeader() {
  const { toggleSidebar, open } = useSidebar();

  return (
    <header className="bg-background/40 sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 overflow-hidden border-b backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) md:rounded-tl-xl md:rounded-tr-xl">
      <SearchProvider>
        <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 lg:gap-6 lg:px-6">
          <div className="flex shrink-0 items-center gap-1 justify-self-start lg:gap-2">
            <Button onClick={toggleSidebar} size="icon" variant="ghost">
              {open ? <PanelLeftClose /> : <PanelLeftOpen />}
            </Button>
            <SearchMobileTrigger />
            <Separator
              orientation="vertical"
              className="mx-2 hidden data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center lg:block"
            />
          </div>

          <div className="hidden w-full min-w-0 justify-center px-2 sm:px-4 lg:flex lg:px-6">
            <SearchDesktop />
          </div>

          <div className="flex shrink-0 items-center justify-self-end gap-2">
            <Notifications />
            <ThemeSwitch />
            <ThemeCustomizerPanel />
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center" />
            <UserMenu />
          </div>
        </div>
      </SearchProvider>
    </header>
  );
}
