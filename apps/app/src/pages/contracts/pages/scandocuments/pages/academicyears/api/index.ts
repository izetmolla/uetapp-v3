import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";


export type AcademicYear = {
    id: number;
    year: string;
    folders: number;
    students: number;
    faculties: number;
    completion: number;
    status: "Active" | "Archived";
    accent: string;
};

export interface GetAcademicYearsResponse {
    academic_years: AcademicYear[];
}
export async function getAcademicYears(params: Record<string, unknown>) {
    return ApiService.fetchData<GetAcademicYearsResponse>({
        url: withAPI("/contracts/scandocuments/academic-years/list"),
        method: "get",
        params,
    });
}   