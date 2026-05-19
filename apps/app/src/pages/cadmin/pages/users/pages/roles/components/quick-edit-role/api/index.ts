import ApiService, { type ResponseWithError, withAPI } from "@workspace/flowtrove/lib/network";
import { ROLES_LIST_BASE, type Role, type RoleMutationResponse } from "../../../api";

export type { Role, RoleMutationResponse };

export interface RoleDetailResponse extends ResponseWithError {
    role: Role;
}

export function getRoleDetail(id: number) {
    return ApiService.fetchDataBody<RoleDetailResponse>({
        url: withAPI(`${ROLES_LIST_BASE}/${id}`),
        method: "get",
    });
}

export function getRoleCreateTemplate() {
    return ApiService.fetchDataBody<RoleDetailResponse>({
        url: withAPI(`${ROLES_LIST_BASE}/new`),
        method: "get",
    });
}

export function createRole(data: { name: string; description?: string; status: string }) {
    return ApiService.fetchDataBody<RoleMutationResponse>({
        url: withAPI(ROLES_LIST_BASE),
        method: "post",
        data,
    });
}

export function updateRole(
    id: number,
    data: { name: string; description?: string; status: string },
) {
    return ApiService.fetchDataBody<RoleMutationResponse>({
        url: withAPI(`${ROLES_LIST_BASE}/${id}`),
        method: "put",
        data,
    });
}
