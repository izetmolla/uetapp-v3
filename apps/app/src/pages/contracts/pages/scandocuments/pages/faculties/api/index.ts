import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";




export interface Faculty {
    slug: string;
    name: string;
    short: string;
    students: number;
    folders: number;
    completion: number;
    accent: string;
    icon: string
}

export interface GetFacultiesResponse {
    faculties: Faculty[];
}

export async function getFaculties(params: Record<string, unknown>) {
    return ApiService.fetchData<GetFacultiesResponse>({
        url: withAPI("/contracts/scandocuments/faculties/list"),
        method: "get",
        params,
    });
}