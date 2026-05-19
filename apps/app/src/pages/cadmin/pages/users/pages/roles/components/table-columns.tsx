import type { ColumnDef } from "@tanstack/react-table";
import { Ellipsis, Shield, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { formatDate } from "@workspace/flowtrove/components/data-table/lib/format";
import type { Role } from "../api";
import useRolesListStore from "../store";

function statusLabel(status: string | undefined): string {
    if (status === "inactive") return "disabled";
    return status?.replace(/_/g, " ") ?? "—";
}

function statusVariant(status: string | undefined): "default" | "secondary" | "destructive" | "outline" {
    if (status === "active" || !status) return "default";
    if (status === "inactive") return "secondary";
    if (status === "deleted") return "destructive";
    return "outline";
}

export function getActionsColumn(): ColumnDef<Role>[] {
    return [
        {
            id: "actions",
            cell: function Cell({ row }) {
                const { openQuickEdit, openDelete, openDisable, openEnable } = useRolesListStore();
                const status = row.original.status;
                const isDeleted = status === "deleted";
                const canEnable = status === "inactive";
                const canDisable = status === "active" || !status;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                aria-label="Open menu"
                                variant="ghost"
                                className="flex size-8 p-0 data-[state=open]:bg-muted"
                            >
                                <Ellipsis className="size-4" aria-hidden="true" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onSelect={() => openQuickEdit(row.original)}>
                                <Shield className="size-4 opacity-70" aria-hidden />
                                Quick Edit
                            </DropdownMenuItem>
                            {canEnable && !isDeleted ? (
                                <DropdownMenuItem onSelect={() => openEnable(row.original)}>
                                    <ShieldCheck className="size-4 opacity-70" aria-hidden />
                                    Enable
                                </DropdownMenuItem>
                            ) : null}
                            {canDisable && !isDeleted ? (
                                <DropdownMenuItem onSelect={() => openDisable(row.original)}>
                                    <ShieldOff className="size-4 opacity-70" aria-hidden />
                                    Disable
                                </DropdownMenuItem>
                            ) : null}
                            {!isDeleted ? <DropdownMenuSeparator /> : null}
                            {!isDeleted ? (
                                <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={() => openDelete(row.original)}
                                >
                                    <Trash2 className="size-4" aria-hidden />
                                    Delete
                                </DropdownMenuItem>
                            ) : null}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            size: 40,
        },
    ];
}

export function getColumnOverrides(): Array<{ id: string } & Partial<ColumnDef<Role>>> {
    return [
        {
            id: "name",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium capitalize">{row.getValue("name") ?? "—"}</span>
                    {row.original.description ? (
                        <span className="text-muted-foreground line-clamp-1 text-xs">
                            {row.original.description}
                        </span>
                    ) : null}
                </div>
            ),
        },
        {
            id: "status",
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Badge variant={statusVariant(status)} className="capitalize">
                        {statusLabel(status)}
                    </Badge>
                );
            },
        },
        {
            id: "users_count",
            cell: ({ row }) => {
                const count = row.getValue("users_count");
                if (count == null) return <span className="text-muted-foreground text-xs">—</span>;
                return (
                    <span className="text-muted-foreground text-sm tabular-nums">
                        {Number(count).toLocaleString()}
                    </span>
                );
            },
        },
        {
            id: "created_at",
            cell: ({ row }) => {
                const raw = row.getValue("created_at");
                if (raw == null || raw === "") {
                    return <span className="text-muted-foreground text-xs">—</span>;
                }
                const date = new Date(String(raw));
                if (Number.isNaN(date.getTime())) {
                    return <span className="text-muted-foreground text-sm">{String(raw)}</span>;
                }
                return (
                    <span className="text-muted-foreground text-sm tabular-nums">
                        {formatDate(date, "MMM dd, yyyy")}
                    </span>
                );
            },
        },
    ];
}
