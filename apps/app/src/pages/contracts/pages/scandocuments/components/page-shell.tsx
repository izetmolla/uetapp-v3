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
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
            <div className="min-w-0 flex-1">
                <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                    {title}
                </h1>
                {subtitle ? (
                    <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
                ) : null}
            </div>
            {right ? (
                <div className="flex w-full shrink-0 justify-stretch lg:w-auto lg:justify-end">
                    {right}
                </div>
            ) : null}
        </div>
    );
}
