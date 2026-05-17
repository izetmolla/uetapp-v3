import type { ColumnDef } from "@tanstack/react-table";
import { Download, Ellipsis, Eye } from "lucide-react";
import { Link } from "react-router";

import { DataTableColumnHeader } from "@workspace/flowtrove/components/data-table/components/data-table-column-header";
import { formatDate } from "@workspace/flowtrove/components/datatable/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import LongText from "@workspace/ui/components/long-text";
import { generateAvatarFallback } from "@workspace/ui/lib/utils";

import type { Student } from "../api";

const STUDY_LEVEL_LABELS: Record<string, string> = {
    bachelor: "Bachelor",
    master: "Master",
    doctorate: "Doktoraturë",
};

export function getActionsColumn(onDownload?: (student: Student) => void): ColumnDef<Student>[] {
    return [
        {
            id: "actions",
            cell: function Cell({ row }) {
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
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem asChild>
                                <Link to={`/sekretaria/supplements/students/${row.original.id}`}>
                                    Shiko Detajet
                                    <DropdownMenuShortcut>
                                        <Eye className="size-3" />
                                    </DropdownMenuShortcut>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => onDownload?.(row.original)}>
                                Shkarko
                                <DropdownMenuShortcut>
                                    <Download className="size-3" />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            size: 40,
        },
    ];
}

export function overrideColumns(): Array<{ id: string } & Partial<ColumnDef<Student>>> {
    return [
        {
            id: "full_name",
            cell: ({ row }) => {
                const name =
                    row.original.full_name ||
                    `${row.original.first_name ?? ""} ${row.original.last_name ?? ""}`.trim() ||
                    "-";
                return (
                    <div className="flex items-center gap-2">
                        <Link className="flex items-center gap-4" to={`/sekretaria/supplements/students/${row.original.id}`}>
                            <Avatar>
                                <AvatarImage src={row.original.image} alt={name} />
                                <AvatarFallback>{generateAvatarFallback(name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <LongText>
                                    <strong>{name}</strong>
                                </LongText>
                                <small>{row.original.student_code ?? "-"}</small>
                            </div>
                        </Link>
                    </div>
                );
            },
        },
        {
            id: "status",
            cell: ({ row }) => <span>{row.original.status || "-"}</span>,
        },
        {
            id: "study_level",
            cell: ({ row }) => (
                <Badge variant="outline">
                    <LongText>
                        {STUDY_LEVEL_LABELS[row.original.study_level] ?? row.original.study_level ?? "-"}
                    </LongText>
                </Badge>
            ),
        },
        {
            id: "faculties",
            cell: ({ row }) => (
                <Badge variant="outline">
                    <LongText>{row.original.faculty_name ?? "-"}</LongText>
                </Badge>
            ),
        },
        {
            id: "study_program",
            cell: ({ row }) => (
                <Badge variant="outline">
                    <LongText>{row.original.study_program_name ?? "-"}</LongText>
                </Badge>
            ),
        },
        {
            id: "study_profile",
            cell: ({ row }) => (
                <Badge variant="outline">
                    <LongText>{row.original.study_profile_name ?? "-"}</LongText>
                </Badge>
            ),
        },
        {
            id: "graduated_at",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Diplomuar më" />
            ),
            cell: ({ row }) => {
                const value = row.original.graduated_at;
                if (!value) return "-";
                return formatDate(new Date(value));
            },
        },
    ];
}
