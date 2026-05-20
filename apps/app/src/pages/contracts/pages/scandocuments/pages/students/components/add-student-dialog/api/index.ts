import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";

export type Student = {
    id: number;
    name: string;
};

export type SearchStudentsParams = {
    query: string;
    year?: string;
    faculty_slug?: string;
    level_slug?: string;
};

export function searchStudents(params: SearchStudentsParams) {
    return ApiService.fetchData<Student[]>({
        url: withAPI("/contracts/scandocuments/students/search"),
        method: "get",
        params: {
            query: params.query,
            ...(params.year ? { year: params.year } : {}),
            ...(params.faculty_slug ? { faculty_slug: params.faculty_slug } : {}),
            ...(params.level_slug ? { level_slug: params.level_slug } : {}),
        },
    });
}
