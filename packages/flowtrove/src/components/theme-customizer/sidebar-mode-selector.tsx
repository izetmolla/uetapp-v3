"use client";

import { Label } from "@workspace/ui/components/label";
import { ToggleGroup, ToggleGroupItem } from "@workspace/ui/components/toggle-group";
import { useSidebar } from "@workspace/ui/components/sidebar";

export function SidebarModeSelector() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="hidden flex-col gap-3 lg:flex">
      <Label>Sidebar mode:</Label>
      <ToggleGroup className="w-full" type="single" onValueChange={() => toggleSidebar()}>
        <ToggleGroupItem variant="outline" className="grow" value="full">
          Default
        </ToggleGroupItem>
        <ToggleGroupItem variant="outline" className="grow" value="centered">
          Icon
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}