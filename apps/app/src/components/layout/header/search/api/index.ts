import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";


export type SearchService = {
    id: string;
    name: string;
    title: string;
    icon?: string;
};


export type Student = {
    id: string;
    full_name: string;
    email: string
    faculty: string;
};
export type Students = Student[];
export type Employee = {
    id: string;
    full_name: string;
    email: string;
    department: string;
};
export type Employees = Employee[];
export type DataResponse = {
    id: string;
    title: string;
    data: Students | Employees;
};



export type SearchResponse = {
    data: DataResponse[];
    services: SearchService[];
};

export function searchServices(params: Record<string, unknown>) {
    return ApiService.fetchData<SearchResponse>({
        url: withAPI("/globalsearch/search"),
        method: "get",
        params,
    });
}