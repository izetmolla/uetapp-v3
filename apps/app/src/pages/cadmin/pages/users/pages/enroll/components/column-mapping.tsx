import { Badge } from "@workspace/ui/components/badge"
import type { ColumnReport } from "../api"
import { cn } from "@workspace/ui/lib/utils"

type ColumnMappingProps = {
    columns: ColumnReport
}

export function ColumnMapping({ columns }: ColumnMappingProps) {
    const hasIssues = columns.unknown.length > 0 || columns.missing.length > 0
    if (!hasIssues && columns.matched.length === 0) {
        return null
    }

    return (
        <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            {columns.matched.length > 0 ? (
                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Matched users table columns (shown in preview)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {columns.matched.map((col) => (
                            <Badge key={col.key} variant="outline" className="font-mono text-xs">
                                {col.label}
                            </Badge>
                        ))}
                    </div>
                </div>
            ) : null}

            {columns.unknown.length > 0 ? (
                <div>
                    <p className="mb-2 text-xs font-medium text-destructive">
                        Not in database — ignored, not imported
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {columns.unknown.map((col) => (
                            <Badge
                                key={col.key}
                                variant="destructive"
                                className="font-mono text-xs line-through opacity-90"
                            >
                                {col.label}
                            </Badge>
                        ))}
                    </div>
                </div>
            ) : null}

            {columns.missing.length > 0 ? (
                <div>
                    <p className="mb-2 text-xs font-medium text-destructive">
                        Missing from CSV — optional; defaults apply on import
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {columns.missing.map((col) => (
                            <Badge
                                key={col.key}
                                variant="outline"
                                className={cn(
                                    "border-destructive/50 font-mono text-xs text-destructive",
                                )}
                            >
                                {col.label}
                            </Badge>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    )
}
