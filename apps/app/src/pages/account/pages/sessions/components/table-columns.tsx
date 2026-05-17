import type { ColumnDef } from "@tanstack/react-table"
import { Globe, Laptop, Monitor, Smartphone } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import LongText from "@workspace/ui/components/long-text"
import type { Session } from "../api"

function parseUserAgent(ua?: string): { label: string; icon: typeof Monitor } {
    const value = ua?.toLowerCase() ?? ""
    if (value.includes("iphone") || value.includes("android") || value.includes("mobile")) {
        return { label: ua ?? "Mobile device", icon: Smartphone }
    }
    if (value.includes("ipad") || value.includes("tablet")) {
        return { label: ua ?? "Tablet", icon: Laptop }
    }
    if (value.includes("windows") || value.includes("mac") || value.includes("linux")) {
        return { label: ua ?? "Desktop", icon: Monitor }
    }
    return { label: ua ?? "Unknown device", icon: Globe }
}

function formatDateTime(value?: string) {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date)
}

function sessionStatus(expiresAt?: string): "active" | "expired" {
    if (!expiresAt) return "active"
    return new Date(expiresAt).getTime() > Date.now() ? "active" : "expired"
}

export function prependSessionColumns(
    currentSessionId?: string,
): Array<{ id: string } & Partial<ColumnDef<Session>>> {
    return [
        {
            id: "user_agent",
            cell: ({ row }) => {
                const { label, icon: Icon } = parseUserAgent(row.original.user_agent)
                const isCurrent = row.original.id === currentSessionId
                return (
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                            <Icon className="size-4 text-muted-foreground" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <LongText className="max-w-md font-medium">{label}</LongText>
                                {isCurrent ? (
                                    <Badge variant="default" className="shrink-0">
                                        This device
                                    </Badge>
                                ) : null}
                            </div>
                            <p className="text-xs text-muted-foreground capitalize">
                                {row.original.method ?? "credentials"}
                            </p>
                        </div>
                    </div>
                )
            },
        },
        {
            id: "expires_at",
            cell: ({ row }) => {
                const status = sessionStatus(row.original.expires_at)
                return (
                    <div className="space-y-1">
                        <p className="text-sm">{formatDateTime(row.original.expires_at)}</p>
                        <Badge variant={status === "active" ? "outline" : "secondary"}>
                            {status === "active" ? "Active" : "Expired"}
                        </Badge>
                    </div>
                )
            },
        },
        {
            id: "created_at",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {formatDateTime(row.original.created_at)}
                </span>
            ),
        },
        {
            id: "ip_address",
            cell: ({ row }) => (
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {row.original.ip_address ?? "—"}
                </code>
            ),
        },
    ]
}
