"use client";

import { Label } from "@workspace/ui/components/label";
import { useThemeConfig } from "../active-theme";
import { ToggleGroup, ToggleGroupItem } from "@workspace/ui/components/toggle-group";
import { BanIcon } from "lucide-react";

export function ThemeScaleSelector() {
  const { theme, setTheme } = useThemeConfig();

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="roundedCorner">Scale:</Label>
      <div>
        <ToggleGroup
          className="w-full"
          value={theme.scale}
          type="single"
          onValueChange={(value) => setTheme({ ...theme, scale: value as any })}>
          <ToggleGroupItem variant="outline" className="grow" value="none">
            <BanIcon />
          </ToggleGroupItem>
          <ToggleGroupItem variant="outline" className="grow" value="sm">
            XS
          </ToggleGroupItem>
          <ToggleGroupItem variant="outline" className="grow" value="lg">
            LG
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}