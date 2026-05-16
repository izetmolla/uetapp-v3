"use client";

import { useThemeConfig } from "../../active-theme";
import { Button } from "@workspace/ui/components/button";
import { DEFAULT_THEME } from "@workspace/flowtrove/lib/themes";

export function ResetThemeButton() {
  const { setTheme } = useThemeConfig();

  const resetThemeHandle = () => {
    setTheme(DEFAULT_THEME);
  };

  return (
    <Button className="mt-4 w-full" onClick={resetThemeHandle}>
      Reset to Default
    </Button>
  );
}
