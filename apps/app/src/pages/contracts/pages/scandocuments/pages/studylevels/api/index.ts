import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";
import type { Faculty } from "../../faculties/api";


export type StudyLevel = {
    id: number;
    slug: string;
    name: string;
    description: string;
    duration: string;
    students: number;
    group: string
    icon: string;
    accent: string;
};

export type StudyLevelGroup = {
    id: number;
    name: string;
    study_levels: StudyLevel[];
};

export interface GetStudyLevelsResponse {
    study_levels: StudyLevel[];
    faculty: Faculty;
    study_level_groups: StudyLevelGroup[];
}

export async function getStudyLevels(params: { year: string, faculty_slug: string }) {
    return ApiService.fetchData<GetStudyLevelsResponse>({
        url: withAPI("/contracts/scandocuments/studylevels/list"),
        method: "get",
        params,
    });
}