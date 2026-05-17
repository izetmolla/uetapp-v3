import type { ColumnDef } from "@tanstack/react-table";

import {
  CalendarIcon,
  CircleDashed,
  Download,
  // CircleDashed,
  Ellipsis,
  Eye,
  Text,
} from "lucide-react";

import { DataTableColumnHeader } from "@workspace/flowtrove/components/datatable/data-table-column-header";
import { formatDate } from "@workspace/flowtrove/components/datatable/lib/format";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Button } from "@workspace/ui/components/button";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import {  generateAvatarFallback } from "@workspace/ui/lib/utils";
import LongText from "@workspace/ui/components/long-text";
import { Badge } from "@workspace/ui/components/badge";
import { Link, type NavigateFunction } from "react-router";
import type { Student } from "../api";
// import { Badge } from "@/components/ui/badge";
// import { Badge } from "@/components/ui/badge";


interface GetStudentsTableColumnsProps {
  io: any[],
  navigate: NavigateFunction,
  onActionClicked: (action: string, student: Student) => void
}

export function getStudentsTableColumns({
  io = [],
  navigate,
  onActionClicked
}: GetStudentsTableColumnsProps): ColumnDef<Student>[] {
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
      id: "full_name",
      accessorKey: "full_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Emer/Mbiemer" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Link className="flex items-center gap-4" to={`/sekretaria/supplements/students/${row.original?.id}`}>
              <Avatar>
                <AvatarImage src={row.original?.image} alt={row.getValue("full_name")} />
                <AvatarFallback>
                  {generateAvatarFallback(
                    `${row.original?.first_name ?? ""} ${row.original?.last_name ?? ""}`.trim() || "-"
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <LongText>
                  <strong>{row.getValue("full_name")}</strong>
                </LongText>
                <small>{row.original?.student_code ?? "-"}</small>
              </div>
            </Link>
          </div>
        );
      },
      meta: {
        label: "Emri i Plote",
        placeholder: "Kerko studentin...",
        variant: "text",
        icon: Text,
        className: "w-full",
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Statusi" />
      ),
      cell: ({ row }) => {
        // const { faculties } = row.original
        return (
          <div className={""}>
            {row.original?.status}
          </div>
        )
      },
      enableColumnFilter: false,
    },
    {
      id: "study_level",
      accessorKey: "study_level",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Niveli Studimit" />
      ),
      cell: ({ row }) => {
        // const { faculties } = row.original
        return (
          <div className={""}>
            <Badge variant='outline'>
              <LongText>{io.find(x => x.id == "i-" + row.original?.study_level)?.name ?? "-"}</LongText>
            </Badge>
            {/* {faculties?.map((faculty, i) => {
              return (
                <Badge
                  key={i}
                  variant='outline'
                >
                  <LongText>{io.find(x => x.id == faculty)?.name ?? "-"}</LongText>
                </Badge>
              )
            })} */}
          </div>
        )
      },
      meta: {
        label: "Niveli Studimit",
        variant: "multiSelect",
        options: io?.filter(x => x.reference == 'study_level')?.map((x) => {
          return {
            label: x.name,
            value: x.id,
            // count: statusCounts[status],
            // icon: getStatusIcon(status),
          }
        }),
        // options: tasks.status.enumValues.map((status) => ({
        //   label: status.charAt(0).toUpperCase() + status.slice(1),
        //   value: status,
        //   // count: statusCounts[status],
        //   // icon: getStatusIcon(status),
        // })),
        icon: CircleDashed,
      },
      enableColumnFilter: true,
    },
    {
      id: "faculties",
      accessorKey: "faculties",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fakultetet" />
      ),
      cell: ({ row }) => {
        return (
          <div className={""}>
            <Badge
              variant='outline'
            >
              <LongText>{row.original?.faculty_name ?? "-"}</LongText>
            </Badge>
          </div>
        )
      },
      meta: {
        label: "Fakultetet",
        variant: "multiSelect",
        options: io?.filter(x => x.reference == 'faculties')?.map((x) => {
          return {
            label: x.name,
            value: x.id,
            // count: statusCounts[status],
            // icon: getStatusIcon(status),
          }
        }),
        // options: tasks.status.enumValues.map((status) => ({
        //   label: status.charAt(0).toUpperCase() + status.slice(1),
        //   value: status,
        //   // count: statusCounts[status],
        //   // icon: getStatusIcon(status),
        // })),
        icon: CircleDashed,
      },
      enableColumnFilter: true,
    },
    {
      id: "study_program",
      accessorKey: "study_program",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Programi Studimit" />
      ),
      cell: ({ row }) => {
        // const { faculties } = row.original
        return (
          <div className={""}>

            <Badge
              variant='outline'
            >
              <LongText>{row.original?.study_program_name ?? "-"}</LongText>
            </Badge>

          </div>
        )
      },
      meta: {
        label: "Programi",
        variant: "multiSelect",
        options: io?.filter(x => x.reference == 'study_program')?.map((x) => {
          return {
            label: x.name,
            value: x.id,
            // count: statusCounts[status],
            // icon: getStatusIcon(status),
          }
        }),
        // options: tasks.status.enumValues.map((status) => ({
        //   label: status.charAt(0).toUpperCase() + status.slice(1),
        //   value: status,
        //   // count: statusCounts[status],
        //   // icon: getStatusIcon(status),
        // })),
        icon: CircleDashed,
      },
      enableColumnFilter: true,
    },
    {
      id: "study_profile",
      accessorKey: "study_profile",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Profili Studimit" />
      ),
      cell: ({ row }) => {
        // const { faculties } = row.original
        return (
          <div className={""}>
            <Badge variant='outline'>
              <LongText>{row.original?.study_profile_name ?? "-"}</LongText>
            </Badge>
          </div>
        )
      },
      meta: {
        label: "Profili",
        variant: "multiSelect",
        options: io?.filter(x => x.reference == 'study_profile')?.map((x) => {
          return {
            label: x.name,
            value: x.id,
            // count: statusCounts[status],
            // icon: getStatusIcon(status),
          }
        }),
        // options: tasks.status.enumValues.map((status) => ({
        //   label: status.charAt(0).toUpperCase() + status.slice(1),
        //   value: status,
        //   // count: statusCounts[status],
        //   // icon: getStatusIcon(status),
        // })),
        icon: CircleDashed,
      },
      enableColumnFilter: true,
    },

    {
      id: "graduated_at",
      accessorKey: "graduated_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Diplomuar më" />
      ),
      cell: ({ cell }) => formatDate(cell.getValue<Date>()),
      meta: {
        label: "Diplomuar më",
        variant: "dateRange",
        icon: CalendarIcon,
      },
      enableColumnFilter: true,
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        // const [isUpdatePending, startUpdateTransition] = useTransition();

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
              <DropdownMenuItem
                onClick={() => navigate(`/sekretaria/supplements/students/${row.original?.id}`)}
              >
                Shiko Detajet<DropdownMenuShortcut><Eye className="size-3" /></DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => onActionClicked("download", row.original)}
              >
                Shkarko <DropdownMenuShortcut><Download className="size-3" /></DropdownMenuShortcut>
              </DropdownMenuItem>



            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 40,
    },
  ];
}