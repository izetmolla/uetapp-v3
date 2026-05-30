import type { BackendColumnsResponse } from "@workspace/flowtrove/components/datatable";
import ApiService, { type ResponseWithError, type ResponseWithPagination, withAPI } from "@workspace/flowtrove/lib/network";


export const USER_FETCH_PERSISTANT = "userspage";

export const USERS_LIST_BASE = "/cadmin/users/list";

export interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    username?: string;
    ldap_username?: string;
    image?: string;
    status?: string;
    is_confirmed?: boolean;
    roles?: string[];
    last_login?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface UserMutationResponse extends ResponseWithError {
    success?: boolean;
    message?: string;
    user?: User;
    updated?: number;
}

export interface UserStatItem {
    id: string;
    name: string;
    value: number;
    description: string;
}

export interface UsersStatsResponse {
    stats: UserStatItem[];
}


type UsersColumnsResponse = BackendColumnsResponse & ResponseWithError;

export async function getUsersList(params: unknown) {
    return ApiService.fetchData<ResponseWithPagination<User>>({
        url: withAPI(USERS_LIST_BASE),
        method: "get",
        params,
    });
}

export async function getUsersColumns() {
    return ApiService.fetchData<UsersColumnsResponse>({
        url: withAPI(`${USERS_LIST_BASE}/columns`),
        method: "get",
    });
}
