"use client";

import {type ReactNode, createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_THEME,type ThemeType } from "@workspace/flowtrove/lib/themes";

const THEME_STORAGE_KEY = "theme";

type ThemeContextType = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ActiveThemeProvider({
  children,
  initialTheme
}: {
  children: ReactNode;
  initialTheme?: ThemeType;
}) {
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (typeof window === "undefined") {
      return initialTheme ?? DEFAULT_THEME;
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!storedTheme) {
      return initialTheme ?? DEFAULT_THEME;
    }

    try {
      const parsedTheme = JSON.parse(storedTheme) as Partial<ThemeType>;
      return {
        ...DEFAULT_THEME,
        ...(initialTheme ?? {}),
        ...parsedTheme,
      };
    } catch {
      return initialTheme ?? DEFAULT_THEME;
    }
  });

  useEffect(() => {
    const body = document.body;

    if (theme.radius != "md") {
      body.setAttribute("data-theme-radius", theme.radius);
    } else {
      body.removeAttribute("data-theme-radius");
    }

    if (theme.preset != "default") {
      body.setAttribute("data-theme-preset", theme.preset);
    } else {
      body.removeAttribute("data-theme-preset");
    }

    body.setAttribute("data-theme-content-layout", theme.contentLayout);

    if (theme.scale != "none") {
      body.setAttribute("data-theme-scale", theme.scale);
    } else {
      body.removeAttribute("data-theme-scale");
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  }, [theme.preset, theme.radius, theme.scale, theme.contentLayout]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useThemeConfig() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeConfig must be used within an ActiveThemeProvider");
  }
  return context;
}