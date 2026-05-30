import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";



interface Resource {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    config_form: any[];
    config: any;
}

interface GetResourceDetailResponse {
   resource: Resource;

}

export function getResourceDetail(id: string) {
    return ApiService.fetchData<GetResourceDetailResponse>({
        url: withAPI(`/cadmin/resources/single`),
        method: "get",
        params: { id },
    });
}