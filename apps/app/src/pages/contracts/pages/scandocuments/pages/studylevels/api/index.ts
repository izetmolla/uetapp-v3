import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";
import type { Faculty } from "../../faculties/api";


export type StudyLevel = {
    slug: string;
    name: string;
    description: string;
    duration: string;
    students: number;
    group: string
    icon: string;
    accent: string;
};


export interface GetStudyLevelsResponse {
    study_levels: StudyLevel[];
    faculty: Faculty;
}

export async function getStudyLevels(params: { year: string, faculty_slug: string }) {
    return ApiService.fetchData<GetStudyLevelsResponse>({
        url: withAPI("/contracts/scandocuments/studylevels/list"),
        method: "get",
        params,
    });
}