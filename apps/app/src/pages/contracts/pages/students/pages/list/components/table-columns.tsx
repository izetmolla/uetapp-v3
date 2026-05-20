import type { ColumnDef } from "@tanstack/react-table";
import { Ellipsis, UserCheck, UserCog, UserX } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { formatDate } from "@workspace/flowtrove/components/data-table/lib/format";
import type { Student } from "../api";
import useStudentsListStore from "../store";

function statusVariant(status: string | undefined): "default" | "secondary" | "outline" {
    if (status === "active" || !status) return "default";
    if (status === "inactive") return "secondary";
    return "outline";
}

export function getActionsColumn(): ColumnDef<Student>[] {
    return [
        {
            id: "actions",
            cell: function Cell({ row }) {
                const { openQuickEdit, openDisable, openEnable } = useStudentsListStore();
                const status = row.original.status;
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
                                <UserCog className="size-4 opacity-70" aria-hidden />
                                Quick Edit
                            </DropdownMenuItem>
                            {canEnable ? (
                                <DropdownMenuItem onSelect={() => openEnable(row.original)}>
                                    <UserCheck className="size-4 opacity-70" aria-hidden />
                                    Enable
                                </DropdownMenuItem>
                            ) : null}
                            {canDisable ? (
                                <DropdownMenuItem onSelect={() => openDisable(row.original)}>
                                    <UserX className="size-4 opacity-70" aria-hidden />
                                    Disable
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

export function getColumnOverrides(): Array<{ id: string } & Partial<ColumnDef<Student>>> {
    return [
        {
            id: "full_name",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{row.getValue("full_name") ?? "—"}</span>
                    {row.original.email ? (
                        <span className="text-muted-foreground line-clamp-1 text-xs">
                            {row.original.email}
                        </span>
                    ) : null}
                </div>
            ),
        },
        {
            id: "status",
            cell: ({ row }) => {
                const status = row.original.status ?? "active";
                return (
                    <Badge variant={statusVariant(status)} className="capitalize">
                        {status === "inactive" ? "inactive" : status}
                    </Badge>
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
