import { cn } from "@workspace/ui/lib/utils";

export const authPageClassName = cn(
    "min-h-screen flex items-center justify-center p-4",
    "bg-background",
);

export const authCardClassName = cn(
    "w-full max-w-[450px] rounded-[12px] border border-border bg-card p-8 text-card-foreground shadow-2xl",
);

export const authInputClassName = cn(
    "h-10 w-full rounded-md border-2 border-solid px-3",
    "border-gray-400 bg-background text-foreground shadow-sm",
    "dark:border-gray-500 dark:bg-card",
    "placeholder:text-muted-foreground",
    "transition-[border-color,box-shadow] duration-150",
    "hover:border-gray-500 dark:hover:border-gray-400",
    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
    "disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:opacity-60",
    "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30",
);

export const authSocialButtonClassName = cn(
    "h-10 w-full gap-2.5 rounded-md border-2 border-solid px-4",
    "border-gray-400 bg-background text-foreground shadow-sm",
    "dark:border-gray-500 dark:bg-card",
    "text-[15px] font-normal",
    "hover:border-gray-500 hover:bg-muted hover:text-foreground",
    "dark:hover:border-gray-400 dark:hover:bg-muted/80",
    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
    "active:border-gray-600 active:bg-muted dark:active:bg-muted/90",
);

export const authLinkClassName = cn(
    "text-sm text-primary hover:text-primary/80 hover:underline",
);

export const authSeparatorClassName = "flex items-center gap-3";
export const authSeparatorLineClassName = "flex-1 border-t border-border";
export const authSeparatorLabelClassName = "shrink-0 text-sm text-muted-foreground";
