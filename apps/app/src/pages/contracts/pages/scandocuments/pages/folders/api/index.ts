import type { StudyLevel } from "../../studylevels/api";
import type { Faculty } from "../../faculties/api";
import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";

export type Folder = {
    id: string;
    name: string;
    students: number;
    scanned: number;
    status: "Complete" | "In Progress" | "Pending";
    lastModified: string;
}

export interface GetFoldersResponse {
    folders: Folder[];
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