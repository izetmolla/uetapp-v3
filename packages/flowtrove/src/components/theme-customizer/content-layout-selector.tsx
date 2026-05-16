"use client";

import { Label } from "@workspace/ui/components/label";
import { useThemeConfig } from "../active-theme";
import { ToggleGroup, ToggleGroupItem } from "@workspace/ui/components/toggle-group";

export function ContentLayoutSelector() {
  const { theme, setTheme } = useThemeConfig();

  return (
    <div className="hidden flex-col gap-3 lg:flex">
      <Label>Content layout</Label>
      <ToggleGroup
        className="w-full"
        value={theme.contentLayout}
        type="single"
        onValueChange={(value) => setTheme({ ...theme, contentLayout: value as any })}>
        <ToggleGroupItem variant="outline" className="grow" value="full">
          Full
        </ToggleGroupItem>
        <ToggleGroupItem variant="outline" className="grow" value="centered">
          Centered
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}