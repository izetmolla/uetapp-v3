import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";


export type SearchService = {
    id: string;
    name: string;
    title: string;
    icon?: string;
    description?: string;
    roles?: string[];
};


export type SearchResponse = {
    services: SearchService[];
    keyword: string;
};

export function searchServices(params: Record<string, unknown>) {
    return ApiService.fetchData<SearchResponse>({
        url: withAPI("/globalsearch/search"),
        method: "get",
        params,
    });
}