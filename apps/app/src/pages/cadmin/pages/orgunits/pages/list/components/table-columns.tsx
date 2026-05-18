import type { ColumnDef } from "@tanstack/react-table";
import { CircleDashed, Ellipsis, Text } from "lucide-react";

import { DataTableColumnHeader } from "@workspace/flowtrove/components/data-table/components/data-table-column-header";
import type { DataTableRowAction } from "@workspace/flowtrove/components/data-table/types/data-table";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import type { OrgUnit } from "../api";
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { generateAvatarFallback } from "@workspace/ui/lib/utils";
import LongText from "@workspace/ui/components/long-text";



interface GetOrgUnitsTableColumnsProps {
    setRowAction?: React.Dispatch<
        React.SetStateAction<DataTableRowAction<OrgUnit> | null>
    >;
}


/** Actions column for use with useBackendColumns appendColumns */
export function getActionsColumn(
    setRowAction?: React.Dispatch<React.SetStateAction<DataTableRowAction<OrgUnit> | null>>
): ColumnDef<OrgUnit>[] {
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
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onSelect={() => setRowAction?.({ row, variant: "quickEdit" })}>Quick Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setRowAction?.({ row, variant: "delete" })}>
                                Delete
                                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            size: 40,
        },
    ];
}



/** Actions column for use with useBackendColumns appendColumns */
export function prependColumns(): Array<{ id: string } & Partial<ColumnDef<OrgUnit>>> {
    return [
        {
            id: "name",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Link to={`#`}>
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={row.original?.image} alt={row.getValue("name") ?? "-"} />
                                <AvatarFallback>{generateAvatarFallback(row.getValue("name") ?? "-")}</AvatarFallback>
                            </Avatar>
                            <div>
                                <LongText className='max-w-36 '>
                                    <strong>{row.getValue("name") || "-"}</strong>
                                </LongText>
                                <small>{row.original?.description ?? "-"}</small>
                            </div>
                        </div>
                    </Link>
                </div>
            ),
        },
    ]
}


export function getOrgUnitsTableColumns({
    setRowAction,
}: GetOrgUnitsTableColumnsProps = {}): ColumnDef<OrgUnit>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-0.5"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-0.5"
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40,
        },
        {
            id: "name",
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),
            cell: ({ row }) => row.getValue("name") ?? "-",
            meta: {
                label: "Name",
                placeholder: "Search org unit...",
                variant: "text",
                icon: Text,
                className: "w-full",
            },
            enableColumnFilter: true,
            enableSorting: true,
        },
        {
            id: "created_at",
            accessorKey: "created_at",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Created" />
            ),
            cell: ({ row }) => row.getValue("created_at") ?? "-",
            meta: {
                label: "Created",
                variant: "text",
                icon: CircleDashed,
            },
            enableColumnFilter: false,
            enableSorting: true,
        },
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
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={() =>
                                    setRowAction?.({
                                        row,
                                        variant: "delete",
                                    })
                                }
                            >
                                Delete
                                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            size: 40,
        },
    ];
}