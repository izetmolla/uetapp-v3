import type { ColumnDef } from "@tanstack/react-table";
import { Ellipsis } from "lucide-react";
import type { DataTableRowAction } from "@workspace/flowtrove/components/datatable/types/data-table";
import { Button } from "@workspace/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import EntityNameCell from "../../../components/entity-name-cell";
import { withNameColumnLayout } from "../../../lib/name-column-override";
import type { Faculty } from "../api";

export function getActionsColumn(
    setRowAction?: React.Dispatch<React.SetStateAction<DataTableRowAction<Faculty> | null>>,
): ColumnDef<Faculty>[] {
    return [
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-label="Open menu" variant="ghost" className="flex size-8 p-0">
                            <Ellipsis className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onSelect={() => setRowAction?.({ row, variant: "quickEdit" })}>
                            Quick Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setRowAction?.({ row, variant: "delete" })}>
                            Delete
                            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            size: 40,
        },
    ];
}

export function prependColumns(): Array<{ id: string } & Partial<ColumnDef<Faculty>>> {
    return [
        withNameColumnLayout<Faculty>({
            id: "name",
            cell: ({ row }) => (
                <EntityNameCell
                    name={String(row.getValue("name") ?? "")}
                    description={row.original?.description}
                    image={row.original?.image}
                />
            ),
        }),
    ];
}
