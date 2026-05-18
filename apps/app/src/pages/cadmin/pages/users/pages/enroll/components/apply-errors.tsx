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
import type { ApplyFailedRow, ApplyResponse } from "../api"

type ApplyErrorsProps = {
    result: ApplyResponse
}

export function ApplyErrors({ result }: ApplyErrorsProps) {
    if (!result.failed_rows?.length) {
        return null
    }

    return (
        <div className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
            <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-destructive">Failed records</h3>
                <Badge variant="destructive">{result.failed} failed</Badge>
                {result.inserted > 0 ? (
                    <Badge variant="secondary">{result.inserted} created</Badge>
                ) : null}
                {result.updated > 0 ? (
                    <Badge variant="outline">{result.updated} updated</Badge>
                ) : null}
            </div>

            <div className="overflow-x-auto rounded-md border border-destructive/20 bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-14">Row</TableHead>
                            <TableHead className="w-24">Action</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Username</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {result.failed_rows.map((row) => (
                            <FailedRow key={`${row.row}-${row.action}`} row={row} />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function FailedRow({ row }: { row: ApplyFailedRow }) {
    return (
        <TableRow>
            <TableCell className="font-mono text-xs">{row.row}</TableCell>
            <TableCell>
                <Badge variant="destructive" className="capitalize">
                    {row.action}
                </Badge>
            </TableCell>
            <TableCell className="max-w-md">
                <LongText className="text-sm">{row.message}</LongText>
                {row.errors?.length ? (
                    <ul className="mt-1 list-inside list-disc text-xs text-destructive">
                        {row.errors.map((e) => (
                            <li key={e}>{e}</li>
                        ))}
                    </ul>
                ) : null}
            </TableCell>
            <TableCell className="text-sm">{row.csv.email ?? "—"}</TableCell>
            <TableCell className="text-sm">{row.csv.username ?? "—"}</TableCell>
        </TableRow>
    )
}
