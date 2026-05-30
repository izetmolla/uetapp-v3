import type { BackendColumnsResponse } from "@workspace/flowtrove/components/datatable";
import ApiService, { type ResponseWithError, type ResponseWithPagination, withAPI } from "@workspace/flowtrove/lib/network";

export const ROLES_FETCH_PERSISTANT = "rolespage";

export const ROLES_LIST_BASE = "/cadmin/users/roles";

export interface Role {
    id: number;
    name: string;
    description?: string;
    status?: string;
    users_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface RoleMutationResponse extends ResponseWithError {
    success?: boolean;
    message?: string;
    role?: Role;
    updated?: number;
}

export interface RoleStatItem {
    id: string;
    name: string;
    value: number;
    description: string;
}

export interface RolesStatsResponse {
    stats: RoleStatItem[];
}

type RolesColumnsResponse = BackendColumnsResponse & ResponseWithError;

export async function getRolesList(params: unknown) {
    return ApiService.fetchData<ResponseWithPagination<Role>>({
        url: withAPI(ROLES_LIST_BASE),
        method: "get",
        params,
    });
}

export async function getRolesColumns() {
    return ApiService.fetchData<RolesColumnsResponse>({
        url: withAPI(`${ROLES_LIST_BASE}/columns`),
        method: "get",
    });
}

export async function getRolesStats() {
    return ApiService.fetchData<RolesStatsResponse>({
        url: withAPI(`${ROLES_LIST_BASE}/stats`),
        method: "get",
    });
}
