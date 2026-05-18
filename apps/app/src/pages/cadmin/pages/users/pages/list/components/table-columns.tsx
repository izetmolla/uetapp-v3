import type { ColumnDef } from "@tanstack/react-table";
import { CircleDashed, Ellipsis, Text, Trash2, UserCheck, UserCog, UserX } from "lucide-react";

import { DataTableColumnHeader } from "@workspace/flowtrove/components/data-table/components/data-table-column-header";
import { formatDate } from "@workspace/flowtrove/components/data-table/lib/format";
import { Badge } from "@workspace/ui/components/badge";
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
import type { User } from "../api";
import useUsersListStore from "../store";
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { generateAvatarFallback } from "@workspace/ui/lib/utils";
import LongText from "@workspace/ui/components/long-text";
import UserRolesCell from "./user-roles-cell";

const USER_STATUS_OPTIONS: { label: string; value: "active" | "inactive" }[] = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
];

interface GetUsersTableColumnsProps {
    setRowAction?: React.Dispatch<React.SetStateAction<unknown>>;
}

/** Actions column for use with useBackendColumns appendColumns */
export function getActionsColumn(): ColumnDef<User>[] {
    return [
        {
            id: "actions",
            cell: function Cell({ row }) {
                const { openQuickEdit, openDelete, openDisable, openEnable } = useUsersListStore();
                const status = row.original.status;
                const isDeleted = status === "deleted";
                const canEnable =
                    status === "disabled" ||
                    status === "inactive" ||
                    status === "suspended" ||
                    status === "pending" ||
                    status === "new";
                const canDisable =
                    status === "active" || status === "new" || status === "pending";

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
                            {canEnable && !isDeleted ? (
                                <DropdownMenuItem onSelect={() => openEnable(row.original)}>
                                    <UserCheck className="size-4 opacity-70" aria-hidden />
                                    Enable
                                </DropdownMenuItem>
                            ) : null}
                            {canDisable && !isDeleted ? (
                                <DropdownMenuItem onSelect={() => openDisable(row.original)}>
                                    <UserX className="size-4 opacity-70" aria-hidden />
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



/** Column cell overrides for use with useBackendColumns */
export function getColumnOverrides(): Array<{ id: string } & Partial<ColumnDef<User>>> {
    return [
        {
            id: "full_name",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Link to={`#`}>
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={row.original?.image} alt={row.getValue("full_name") ?? "-"} />
                                <AvatarFallback>{generateAvatarFallback(row.getValue("full_name") ?? "-")}</AvatarFallback>
                            </Avatar>
                            <div>
                                <LongText className='max-w-36 '>
                                    <strong>{row.getValue("full_name") || "-"}</strong>
                                </LongText>
                                <small>{row.original?.email ?? "-"}</small>
                            </div>
                        </div>
                    </Link>
                </div>
            ),
        },
        {
            id: "roles",
            cell: ({ row }) => <UserRolesCell roles={row.original.roles} />,
            size: 220,
            minSize: 160,
        },
        {
            id: "last_login",
            cell: ({ row }) => {
                const raw = row.getValue("last_login");
                if (raw == null || raw === "") {
                    return <span className="text-muted-foreground text-xs">—</span>;
                }
                const date = new Date(String(raw));
                if (Number.isNaN(date.getTime())) {
                    return <span className="text-muted-foreground text-sm">{String(raw)}</span>;
                }
                return (
                    <span className="text-muted-foreground text-sm tabular-nums">
                        {formatDate(date, "MMM dd, yyyy · HH:mm")}
                    </span>
                );
            },
        },
    ];
}

export function prependColumns(): Array<{ id: string } & Partial<ColumnDef<User>>> {
    return getColumnOverrides();
}

export function getUsersTableColumns({
    setRowAction,
}: GetUsersTableColumnsProps = {}): ColumnDef<User>[] {
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
                placeholder: "Search user...",
                variant: "text",
                icon: Text,
                className: "w-full",
            },
            enableColumnFilter: true,
            enableSorting: true,
        },
        {
            id: "email",
            accessorKey: "email",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Email" />
            ),
            cell: ({ row }) => row.getValue("email") ?? "-",
            meta: {
                label: "Email",
                placeholder: "Search email...",
                variant: "text",
                icon: Text,
                className: "w-full",
            },
            enableColumnFilter: true,
            enableSorting: true,
        },
        {
            id: "role",
            accessorKey: "role",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Role" />
            ),
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize">
                    {row.getValue("role") ?? "-"}
                </Badge>
            ),
            meta: {
                label: "Role",
                variant: "text",
                icon: CircleDashed,
                className: "w-full",
            },
            enableColumnFilter: true,
            enableSorting: true,
        },
        {
            id: "status",
            accessorKey: "status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize">
                    {row.getValue<string>("status") ?? "-"}
                </Badge>
            ),
            meta: {
                label: "Status",
                variant: "multiSelect",
                options: USER_STATUS_OPTIONS.map((opt) => ({
                    label: opt.label,
                    value: opt.value,
                })),
                icon: CircleDashed,
            },
            enableColumnFilter: true,
            enableSorting: true,
        },
        {
            id: "createdAt",
            accessorKey: "createdAt",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Created At" />
            ),
            cell: ({ row }) => row.getValue("createdAt") ?? "-",
            meta: {
                label: "Created At",
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