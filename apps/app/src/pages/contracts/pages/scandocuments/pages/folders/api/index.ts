import type { StudyLevel } from "../../studylevels/api";
import type { Faculty } from "../../faculties/api";
import ApiService, {
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

