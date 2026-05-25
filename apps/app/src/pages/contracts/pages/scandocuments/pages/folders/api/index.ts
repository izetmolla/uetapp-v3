import type { StudyLevel } from "../../studylevels/api";
import type { Faculty } from "../../faculties/api";
import ApiService, {
    BaseService,
    type ResponseWithError,
    withAPI,
} from "@workspace/flowtrove/lib/network";

export type Folder = {
    id: number;
    name: string;
    students: number;
    scanned: number;
    status: "Complete" | "In Progress" | "Pending";
    last_modified: string;
};

export interface FoldersStats {
    total_folders: number;
    total_students: number;
    scanned_count: number;
    scanned_percent: number;
    last_updated: string | null;
}

export interface GetFoldersResponse {
    folders: Folder[];
    stats: FoldersStats;
    study_level: StudyLevel;
    faculty: Faculty;
}

export function getFolders(params: Record<string, unknown>) {
    return ApiService.fetchData<GetFoldersResponse>({
        url: withAPI("/contracts/scandocuments/folders/list"),
        method: "get",
        params,
    });
}

export interface FolderMutationResponse extends ResponseWithError {
    success?: boolean;
    message?: string;
}

export interface DownloadFolderParams {
    id: number;
    year: string;
    faculty_slug: string;
    level_slug: string;
}

export function deleteFolder(id: number) {
    return ApiService.fetchDataBody<FolderMutationResponse>({
        url: withAPI(`/contracts/scandocuments/folders/${id}`),
        method: "delete",
    });
}

export async function downloadFolder(params: DownloadFolderParams) {
    const { id, year, faculty_slug, level_slug } = params;
    const response = await BaseService.get(
        withAPI(`/contracts/scandocuments/folders/${id}/download`),
        {
            params: { year, faculty_slug, level_slug },
            responseType: "blob",
        },
    );

    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `folder-${id}-export.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
