"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@workspace/flowtrove/components/providers/theme-provider";
import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

export default function ThemeSwitch() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <Button
            size="icon-sm"
            variant="ghost"
            className="relative"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
