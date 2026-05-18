import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"
import LongText from "@workspace/ui/components/long-text"
import type { ColumnInfo, PreviewRow } from "../api"
import { cn } from "@workspace/ui/lib/utils"

const COLUMN_LABELS: Record<string, string> = {
    id: "ID",
    first_name: "First name",
    last_name: "Last name",
    email: "Email",
    username: "Username",
    password: "Password",
    image: "Image",
    status: "Status",
    roles: "Roles",
}

function actionVariant(action: PreviewRow["action"]) {
    switch (action) {
        case "insert":
            return "default" as const
        case "update":
            return "secondary" as const
        default:
            return "destructive" as const
    }
}

function displayValue(v?: string) {
    return v?.trim() ? v : "—"
}

function cellValue(row: PreviewRow, key: string): string {
    const csv = row.csv
    switch (key) {
        case "id":
            return displayValue(csv.id)
        case "first_name":
            return displayValue(csv.first_name)
        case "last_name":
            return displayValue(csv.last_name)
        case "email":
            return displayValue(csv.email)
        case "username":
            return displayValue(csv.username)
        case "password":
            return csv.password?.trim() ? "••••••••" : "—"
        case "image":
            return displayValue(csv.image)
        case "status":
            return displayValue(csv.status) || "active"
        case "roles":
            return displayValue(csv.roles)
        default:
            return "—"
    }
}

function isInvalidField(row: PreviewRow, key: string) {
    return row.invalid_fields?.includes(key) ?? false
}

type PreviewTableProps = {
    rows: PreviewRow[]
    matchedColumns: ColumnInfo[]
}

export function PreviewTable({ rows, matchedColumns }: PreviewTableProps) {
    const dataColumns = matchedColumns.filter((c) => c.status === "matched")

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-14">Row</TableHead>
                        <TableHead className="w-24">Action</TableHead>
                        <TableHead className="min-w-[12rem]">Description</TableHead>
                        {dataColumns.map((col) => (
                            <TableHead key={col.key} className="whitespace-nowrap">
                                {COLUMN_LABELS[col.key] ?? col.label}
                            </TableHead>
                        ))}
                        <TableHead>Existing</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow
                            key={row.row}
                            className={row.action === "error" ? "bg-destructive/5" : undefined}
                        >
                            <TableCell className="font-mono text-xs">{row.row}</TableCell>
                            <TableCell>
                                <Badge variant={actionVariant(row.action)} className="capitalize">
                                    {row.action}
                                </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs">
                                <LongText className="text-sm">{row.description}</LongText>
                                {row.errors?.length ? (
                                    <ul className="mt-1 list-inside list-disc text-xs text-destructive">
                                        {row.errors.map((e) => (
                                            <li key={e}>{e}</li>
                                        ))}
                                    </ul>
                                ) : null}
                            </TableCell>
                            {dataColumns.map((col) => (
                                <TableCell
                                    key={col.key}
                                    className={cn(
                                        "text-sm",
                                        isInvalidField(row, col.key) &&
                                            "bg-destructive/10 font-medium text-destructive",
                                    )}
                                >
                                    {cellValue(row, col.key)}
                                </TableCell>
                            ))}
                            <TableCell className="text-sm text-muted-foreground">
                                {row.existing
                                    ? [row.existing.email, row.existing.username]
                                          .filter(Boolean)
                                          .join(" · ")
                                    : "—"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
