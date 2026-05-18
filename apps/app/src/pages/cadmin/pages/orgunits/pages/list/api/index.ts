import ApiService, { type ResponseWithError, type ResponseWithPagination, withAPI } from "@workspace/flowtrove/lib/network";


export interface OrgUnit {
    id: string;
    name: string;
    slug: string;
    image: string;
    description: string;
    content: any;
    unit: string;
    is_default: boolean;
    is_active: boolean;
    
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

interface ColumnsResponse extends ResponseWithError {
    columns: any[];
}

export async function getOrgUnitsList(params: unknown) {
    return ApiService.fetchData<ResponseWithPagination<OrgUnit>>({
        url: withAPI('/cadmin/orgunits/list'),
        method: 'get',
        params,
    });
}

export async function getOrgUnitsColumns() {
    return ApiService.fetchData<ColumnsResponse>({
        url: withAPI('/cadmin/orgunits/list/columns'),
        method: 'get',
    });
}

export { createOrgUnit, updateOrgUnit, deleteOrgUnits } from "../components/add-org-unit-dialog/api";