import { useMemo, useState, type ReactNode } from "react";
import { LayoutBuilder } from "@workspace/flowtrove/components/layout/builder";
import type { LayoutBuilderItem } from "@workspace/flowtrove/components/layout/builder";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

type FormExampleCardProps = {
    title: string;
    description: string;
    level: "Basic" | "Intermediate" | "Advanced" | "Validation";
    items: LayoutBuilderItem[];
    data?: Record<string, unknown>;
    footer?: ReactNode;
};

const levelVariant: Record<FormExampleCardProps["level"], "default" | "secondary" | "outline" | "destructive"> = {
    Basic: "secondary",
    Intermediate: "default",
    Advanced: "outline",
    Validation: "destructive",
};

export function FormExampleCard({
    title,
    description,
    level,
    items,
    data,
    footer,
}: FormExampleCardProps) {
    const [showJson, setShowJson] = useState(false);
    const json = useMemo(() => JSON.stringify(items, null, 2), [items]);

    return (
        <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{title}</CardTitle>
                            <Badge variant={levelVariant[level]}>{level}</Badge>
                        </div>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowJson((v) => !v)}
                    >
                        {showJson ? "Hide JSON" : "View JSON"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                {showJson ? (
                    <pre className="max-h-96 overflow-auto rounded-lg border bg-muted/40 p-4 text-xs leading-relaxed">
                        {json}
                    </pre>
                ) : null}
                <div className="space-y-4">
                    <LayoutBuilder items={items} data={data} className="space-y-4" />
                    {footer}
                </div>
            </CardContent>
        </Card>
    );
}

type ExampleGridProps = {
    children: ReactNode;
    className?: string;
};

export function ExampleGrid({ children, className }: ExampleGridProps) {
    return <div className={cn("grid gap-6 xl:grid-cols-2", className)}>{children}</div>;
}
