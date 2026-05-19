import ApiService, { type ResponseWithError, withAPI } from "@workspace/flowtrove/lib/network";
import { USERS_LIST_BASE, type User, type UserMutationResponse } from "../../../api";

export type { User, UserMutationResponse };

export interface UserDetailResponse extends ResponseWithError {
    user: User;
    available_roles: string[];
}

export function getUserDetail(id: string) {
    return ApiService.fetchDataBody<UserDetailResponse>({
        url: withAPI(`${USERS_LIST_BASE}/${id}`),
        method: "get",
    });
}

export function getUserCreateTemplate() {
    return ApiService.fetchDataBody<UserDetailResponse>({
        url: withAPI(`${USERS_LIST_BASE}/new`),
        method: "get",
    });
}

export function createUser(data: {
    first_name: string;
    last_name: string;
    email: string;
    username?: string;
    ldap_username?: string;
    image?: string;
    status: string;
    password?: string;
    password_confirm?: string;
    is_confirmed?: boolean;
    roles?: string[];
}) {
    return ApiService.fetchDataBody<UserMutationResponse>({
        url: withAPI(USERS_LIST_BASE),
        method: "post",
        data,
    });
}

export function updateUserGeneral(
    id: string,
    data: {
        first_name: string;
        last_name: string;
        email: string;
        username?: string;
        ldap_username?: string;
        image?: string;
        status: string;
    },
) {
    return ApiService.fetchDataBody<UserMutationResponse>({
        url: withAPI(`${USERS_LIST_BASE}/${id}/general`),
        method: "put",
        data,
    });
}

export function updateUserPassword(
    id: string,
    data: {
        password?: string;
        password_confirm?: string;
        is_confirmed?: boolean;
    },
) {
    return ApiService.fetchDataBody<UserMutationResponse>({
        url: withAPI(`${USERS_LIST_BASE}/${id}/password`),
        method: "put",
        data,
    });
}

export function updateUserRoles(id: string, roles: string[]) {
    return ApiService.fetchDataBody<UserMutationResponse>({
        url: withAPI(`${USERS_LIST_BASE}/${id}/roles`),
        method: "put",
        data: { roles },
    });
}
