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
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { generateAvatarFallback } from "@workspace/ui/lib/utils";
import LongText from "@workspace/ui/components/long-text";

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
                            <DropdownMenuItem
                                onSelect={() => { }}>
                                <UserCog className="size-4 opacity-70" aria-hidden />
                                Quick Edit
                            </DropdownMenuItem>
                            {canEnable ? (
                                <DropdownMenuItem onSelect={() => { }}>
                                    <UserCheck className="size-4 opacity-70" aria-hidden />
                                    Enable
                                </DropdownMenuItem>
                            ) : null}
                            {canDisable ? (
                                <DropdownMenuItem onSelect={() => { }}>
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
            id: "fullname",
            cell: ({ row }) => {
                const year = row.original?.reg_year ? `(${row.original?.reg_year}-${Number(row.original?.reg_year) + 1})` : "-";
                return (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Avatar>
                                <AvatarImage src={"#"} alt={row.getValue("fullname") ?? "-"} />
                                <AvatarFallback>{generateAvatarFallback(row.getValue("fullname") ?? "-")}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-1">
                                    <LongText className='max-w-50'>
                                        <strong>{row.getValue("fullname") || "-"}</strong>
                                    </LongText>
                                    {year}
                                </div>
                                <small className="font-semibold">{row.original?.program ?? "-"}</small> - <small>{row.original?.faculty ?? "-"}</small>
                            </div>
                        </div>
                    </div>
                )
            },
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
