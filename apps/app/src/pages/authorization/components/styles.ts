import { cn } from "@workspace/ui/lib/utils";

export const authPageClassName = cn(
    "min-h-screen flex items-center justify-center p-4",
    "bg-background",
);

export const authCardClassName = cn(
    "w-full max-w-[450px] rounded-xl border border-border/60 bg-card p-8 text-card-foreground shadow-lg",
);

export const authInputClassName = cn(
    "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-none",
    "placeholder:text-muted-foreground",
    "transition-colors duration-150",
    "hover:border-foreground/20",
    "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/25 focus-visible:outline-none",
    "disabled:cursor-not-allowed disabled:border-border disabled:bg-muted/50 disabled:opacity-60",
    "aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20",
);

export const authSocialButtonClassName = cn(
    "h-10 w-full gap-2.5 rounded-lg border border-input bg-background px-4 text-[15px] font-normal text-foreground shadow-none",
    "transition-colors duration-150",
    "hover:border-foreground/20 hover:bg-muted/50 hover:text-foreground",
    "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/25 focus-visible:outline-none",
    "active:bg-muted/80",
);

export const authLinkClassName = cn(
    "text-sm text-primary hover:text-primary/80 hover:underline",
);

export const authSeparatorClassName = "flex items-center gap-3";
export const authSeparatorLineClassName = "flex-1 border-t border-border/60";
export const authSeparatorLabelClassName = "shrink-0 text-sm text-muted-foreground";
