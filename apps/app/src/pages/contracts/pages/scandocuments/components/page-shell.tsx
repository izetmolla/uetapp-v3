import { type ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
    return <div className="page-enter">{children}</div>;
}

export function PageHeader({
    title,
    subtitle,
    right,
}: {
    title: string;
    subtitle?: string;
    right?: ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
                <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>
                )}
            </div>
            {right}
        </div>
    );
}