import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@workspace/flowtrove/components/providers/theme-provider";

type Theme = "light" | "dark";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle color theme"
      className={`relative inline-flex items-center justify-center size-9 rounded-md border border-hairline bg-surface-1 hover:bg-surface-2 text-foreground transition-colors ${className}`}
    >
      {mounted && theme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </button>
  );
}
