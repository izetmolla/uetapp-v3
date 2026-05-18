import ApiService, { type ResponseWithError, withAPI } from "@workspace/flowtrove/lib/network"
import { BaseService } from "@workspace/flowtrove/lib/network/client"

export interface CsvUserRow {
    id?: string
    first_name?: string
    last_name?: string
    email?: string
    username?: string
    password?: string
    image?: string
    status?: string
    roles?: string
}

export interface ExistingUser {
    id: string
    first_name?: string
    last_name?: string
    email?: string
    username?: string
    image?: string
    status?: string
    roles?: string
}

export type EnrollAction = "insert" | "update" | "error"

export interface ColumnInfo {
    key: string
    status: "matched" | "unknown" | "missing"
    label: string
}

export interface ColumnReport {
    matched: ColumnInfo[]
    unknown: ColumnInfo[]
    missing: ColumnInfo[]
}

export interface PreviewRow {
    row: number
    action: EnrollAction
    description: string
    csv: CsvUserRow
    existing?: ExistingUser
    errors?: string[]
    invalid_fields?: string[]
}

export interface PreviewStats {
    total: number
    insert: number
    update: number
    invalid: number
}

export interface PreviewResponse extends ResponseWithError {
    rows: PreviewRow[]
    stats: PreviewStats
    columns: ColumnReport
    file_columns?: string[]
    errors?: string[]
}

export interface ApplyRow {
    row: number
    action: EnrollAction
    csv: CsvUserRow
}

export interface ApplyFailedRow {
    row: number
    action: string
    message: string
    csv: CsvUserRow
    errors?: string[]
}

export interface ApplyResponse extends ResponseWithError {
    inserted: number
    updated: number
    failed: number
    skipped?: number
    errors?: string[]
    failed_rows?: ApplyFailedRow[]
}

export const ENROLL_TEMPLATE_URL = withAPI("/cadmin/users/enroll/template")

export async function downloadEnrollTemplate() {
    const response = await BaseService.get(ENROLL_TEMPLATE_URL, { responseType: "blob" })
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "users-enroll-template.csv"
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
}

export async function previewEnrollCSV(file: File) {
    const formData = new FormData()
    formData.append("file", file)
    return BaseService.post<PreviewResponse>(
        withAPI("/cadmin/users/enroll/preview"),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
    )
}

export async function applyEnrollChanges(
    rows: ApplyRow[],
    skipErrors = true,
    fileColumns?: string[],
) {
    return ApiService.fetchData<ApplyResponse>({
        url: withAPI("/cadmin/users/enroll/apply"),
        method: "post",
        data: { rows, skip_errors: skipErrors, file_columns: fileColumns ?? [] },
    })
}
