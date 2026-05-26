import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";
import type { Faculty } from "../../../data/mockData";
import type { StudyLevel } from "../../../data/mockData";
import type { AcademicYear } from "../../../data/mockData";
import type { Folder } from "../../../data/mockData";
import type { StudyLevelGroup } from "../../studylevels/api";

type Student = {
    id: number;
    name: string;
    initials: string;
    program: string;
    docs: number;
    status: "Verified" | "Pending Review" | "Missing Docs";
    scannedDate: string;
    color: string;
}
export interface GetStudentsResponse {
    students: Student[];
    faculty: Faculty;
    study_level: StudyLevel;
    study_level_group: StudyLevelGroup;
    academic_year: AcademicYear;
    folder: Folder;
}

export async function getStudents(params: unknown) {
    return ApiService.fetchData<GetStudentsResponse>({
        url: withAPI("/contracts/scandocuments/students/list"),
        method: "get",
        params,
    });
}