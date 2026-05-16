import { NavLink, useParams } from "react-router";
import { Database, LayoutTemplate } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

/**
 * Primary navigation between entity data (index) and schema sub-routes.
 * Uses NavLink with `end` on the data route so `/entities/:id/schema` does not mark Data active.
 */
export function EntityDetailSectionNav({ className }: { className?: string }) {
    const { ws, entity_id } = useParams();
    if (!ws || !entity_id) return null;

    const base = `/workspace/${ws}/entities/${entity_id}`;

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        cn(
            "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
            "text-muted-foreground hover:bg-background/80 hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted/30",
            isActive &&
                "bg-background text-foreground shadow-sm ring-1 ring-border/60 dark:bg-input/40 dark:ring-border",
        );

    return (
        <nav
            className={cn(
                "inline-flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5 ring-1 ring-border/50",
                className,
            )}
            aria-label="Entity detail sections"
        >
            <NavLink to={base} end className={linkClass}>
                <Database className="size-3.5 opacity-70" aria-hidden />
                Data
            </NavLink>
            <NavLink to={`${base}/schema`} className={linkClass}>
                <LayoutTemplate className="size-3.5 opacity-70" aria-hidden />
                Schema
            </NavLink>
        </nav>
    );
}
