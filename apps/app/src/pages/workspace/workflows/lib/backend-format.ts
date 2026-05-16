import type { Backend } from "../types";

/** Rotating surfaces so list/grid rows read clearly in light and dark mode. */
const ITEM_SURFACES = [
    "bg-card dark:bg-card",
    "bg-muted/55 dark:bg-muted/20",
    "bg-secondary/50 dark:bg-secondary/18",
    "bg-accent/30 dark:bg-accent/[0.09]",
    "bg-primary/[0.05] dark:bg-primary/[0.08]",
] as const;

export function backendItemSurfaceClass(index: number): string {
    return ITEM_SURFACES[index % ITEM_SURFACES.length] ?? ITEM_SURFACES[0];
}

export function methodColor(method: Backend["method"]): string {
    switch (method) {
        case "GET": return "text-cyan border-cyan/40 bg-cyan/10";
        case "POST": return "text-[oklch(0.72_0.18_150)] border-[oklch(0.72_0.18_150)]/40 bg-[oklch(0.72_0.18_150)]/10";
        case "PUT": return "text-[oklch(0.82_0.17_80)] border-[oklch(0.82_0.17_80)]/40 bg-[oklch(0.82_0.17_80)]/10";
        case "PATCH": return "text-[oklch(0.78_0.16_60)] border-[oklch(0.78_0.16_60)]/40 bg-[oklch(0.78_0.16_60)]/10";
        case "DELETE": return "text-destructive border-destructive/40 bg-destructive/10";
        case "CRON": return "text-violet-300 border-violet/40 bg-[color-mix(in_oklab,var(--violet)_15%,transparent)]";
    }
}

export function statusColor(status: Backend["status"]): string {
    switch (status) {
        case "active": return "bg-[oklch(0.72_0.18_150)] shadow-[0_0_8px_oklch(0.72_0.18_150)]";
        case "draft": return "bg-[oklch(0.82_0.17_80)] shadow-[0_0_8px_oklch(0.82_0.17_80)]";
        case "error": return "bg-destructive shadow-[0_0_8px_var(--destructive)]";
    }
}

export function timeAgo(iso: string): string {
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return "—";
    const diff = Date.now() - t;
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}
