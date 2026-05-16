/** Subtle tinted pill per verb (readable in light/dark). */
export function getHttpMethodBadgeClass(method: string): string {
    switch (method.toUpperCase()) {
        case "GET":
            return "border-emerald-500/35 bg-emerald-500/[0.12] text-emerald-900 hover:bg-emerald-500/20 dark:text-emerald-300";
        case "POST":
            return "border-sky-500/35 bg-sky-500/[0.12] text-sky-900 hover:bg-sky-500/20 dark:text-sky-300";
        case "PUT":
            return "border-amber-500/40 bg-amber-500/[0.12] text-amber-950 hover:bg-amber-500/20 dark:text-amber-200";
        case "PATCH":
            return "border-violet-500/35 bg-violet-500/[0.12] text-violet-900 hover:bg-violet-500/20 dark:text-violet-300";
        case "DELETE":
            return "border-red-500/35 bg-red-500/[0.12] text-red-900 hover:bg-red-500/20 dark:text-red-300";
        case "HEAD":
            return "border-slate-400/45 bg-slate-500/[0.1] text-slate-800 hover:bg-slate-500/15 dark:text-slate-300";
        case "OPTIONS":
            return "border-zinc-400/45 bg-zinc-500/[0.1] text-zinc-800 hover:bg-zinc-500/15 dark:text-zinc-300";
        case "CONNECT":
        case "TRACE":
            return "border-teal-500/35 bg-teal-500/[0.1] text-teal-900 hover:bg-teal-500/18 dark:text-teal-300";
        case "ALL":
            return "border-indigo-500/35 bg-indigo-500/[0.12] text-indigo-900 hover:bg-indigo-500/20 dark:text-indigo-300";
        default:
            return "border-border/80 bg-muted/40 text-foreground hover:bg-muted/65";
    }
}
