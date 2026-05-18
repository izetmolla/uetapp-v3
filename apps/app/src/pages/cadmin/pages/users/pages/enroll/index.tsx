import { useCallback, useRef, useState } from "react"
import ContentLoader, { type BreadcrumbItem } from "@workspace/flowtrove/components/content-loader"
import { Button } from "@workspace/ui/components/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Label } from "@workspace/ui/components/label"
import { Download, FileUp, Loader2, Upload } from "lucide-react"
import { Link } from "react-router"
import { toast } from "sonner"
import {
    applyEnrollChanges,
    downloadEnrollTemplate,
    previewEnrollCSV,
    type ApplyResponse,
    type ApplyRow,
    type PreviewResponse,
} from "./api"
import { ApplyErrors } from "./components/apply-errors"
import { ColumnMapping } from "./components/column-mapping"
import { PreviewTable } from "./components/preview-table"

const breadcrumb: BreadcrumbItem[] = [
    { label: "Admin", to: "/cadmin" },
    { label: "Users", to: "/cadmin/users" },
    { label: "Enroll" },
]

const TEMPLATE_COLUMNS =
    "id, first_name, last_name, email, username, password, image, status, roles"

const EnrollPage = () => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<PreviewResponse | null>(null)
    const [uploading, setUploading] = useState(false)
    const [applying, setApplying] = useState(false)
    const [skipErrors, setSkipErrors] = useState(true)
    const [applyResult, setApplyResult] = useState<ApplyResponse | null>(null)

    const handleFile = useCallback(async (selected: File | null) => {
        if (!selected) return
        if (!selected.name.toLowerCase().endsWith(".csv")) {
            toast.error("Please upload a .csv file")
            return
        }
        setFile(selected)
        setUploading(true)
        setPreview(null)
        setApplyResult(null)
        try {
            const res = await previewEnrollCSV(selected)
            setPreview(res.data)
        } catch {
            toast.error("Failed to parse CSV. Check the template columns and try again.")
            setFile(null)
        } finally {
            setUploading(false)
        }
    }, [])

    const rowsToApply: ApplyRow[] =
        preview?.rows.map((r) => ({
            row: r.row,
            action: r.action,
            csv: r.csv,
        })) ?? []

    const validCount =
        preview?.rows.filter((r) => r.action === "insert" || r.action === "update").length ?? 0

    const handleApply = async () => {
        if (rowsToApply.length === 0) {
            toast.error("No rows to apply")
            return
        }
        if (!skipErrors && (preview?.stats.invalid ?? 0) > 0) {
            toast.error("Fix preview errors first, or enable “Skip errors”")
            return
        }
        if (skipErrors && validCount === 0) {
            toast.error("No valid rows to apply")
            return
        }
        setApplying(true)
        setApplyResult(null)
        try {
            const rows = skipErrors
                ? rowsToApply
                : rowsToApply.filter((r) => r.action === "insert" || r.action === "update")
            const res = await applyEnrollChanges(rows, skipErrors, preview?.file_columns)
            const body = res.data
            setApplyResult(body)
            if (body.inserted > 0 || body.updated > 0) {
                toast.success(`Imported: ${body.inserted} created, ${body.updated} updated`)
            }
            if (body.failed > 0) {
                toast.warning(`${body.failed} row(s) failed — see list below`)
            } else if (body.inserted === 0 && body.updated === 0) {
                toast.error("No rows were imported")
            }
            if (body.failed === 0) {
                setPreview(null)
                setFile(null)
                if (inputRef.current) inputRef.current.value = ""
            }
        } catch {
            toast.error("Failed to apply changes")
        } finally {
            setApplying(false)
        }
    }

    return (
        <ContentLoader breadcrumb={breadcrumb} title="Enroll users from CSV" showHeaderSeparator>
            <div className="flex flex-col gap-6">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">CSV template</CardTitle>
                        <CardDescription>
                            Use exactly these columns: {TEMPLATE_COLUMNS}. Email and username must be
                            unique in the file and are used to match existing users for updates.
                            Leave <code className="text-xs">id</code> empty for new users.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={() => downloadEnrollTemplate()}>
                            <Download className="mr-2 size-4" />
                            Download template
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link to="/cadmin/users">Back to users</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Upload CSV</CardTitle>
                        <CardDescription>
                            Upload a filled template to preview inserts and updates before applying.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".csv,text/csv"
                            className="hidden"
                            onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
                        />
                        <div
                            className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 p-6 transition-colors hover:bg-muted/50"
                            onClick={() => inputRef.current?.click()}
                            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                            role="button"
                            tabIndex={0}
                        >
                            {uploading ? (
                                <Loader2 className="size-8 animate-spin text-muted-foreground" />
                            ) : (
                                <FileUp className="size-8 text-muted-foreground" />
                            )}
                            <p className="text-sm font-medium">
                                {file ? file.name : "Click to select a CSV file"}
                            </p>
                            <p className="text-xs text-muted-foreground">or drag and drop (max one file)</p>
                        </div>

                        {preview ? (
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">{preview.stats.total} rows</Badge>
                                <Badge>{preview.stats.insert} to insert</Badge>
                                <Badge variant="outline">{preview.stats.update} to update</Badge>
                                {preview.stats.invalid > 0 ? (
                                    <Badge variant="destructive">{preview.stats.invalid} errors</Badge>
                                ) : null}
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                {preview && preview.rows.length > 0 ? (
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                            <div>
                                <CardTitle className="text-base">Preview</CardTitle>
                                <CardDescription>
                                    Review each row before creating or updating users in the database.
                                </CardDescription>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="skip-errors"
                                        checked={skipErrors}
                                        onCheckedChange={(v) => setSkipErrors(v === true)}
                                    />
                                    <Label htmlFor="skip-errors" className="text-sm font-normal">
                                        Skip errors and show failed rows at the end
                                    </Label>
                                </div>
                                <Button
                                    type="button"
                                    disabled={applying || rowsToApply.length === 0 || validCount === 0}
                                    onClick={() => void handleApply()}
                                >
                                    {applying ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <Upload className="mr-2 size-4" />
                                    )}
                                    Apply{" "}
                                    {skipErrors
                                        ? `${validCount} valid (${preview?.stats.invalid ?? 0} skipped)`
                                        : `${validCount} change${validCount === 1 ? "" : "s"}`}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ColumnMapping columns={preview.columns} />
                            <PreviewTable
                                rows={preview.rows}
                                matchedColumns={preview.columns.matched}
                            />
                        </CardContent>
                    </Card>
                ) : null}

                {applyResult ? <ApplyErrors result={applyResult} /> : null}
            </div>
        </ContentLoader>
    )
}

export default EnrollPage
