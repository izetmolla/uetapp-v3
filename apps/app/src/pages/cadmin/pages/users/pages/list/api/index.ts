import ApiService, { type ResponseWithError, type ResponseWithPagination, withAPI } from "@workspace/flowtrove/lib/network";


export interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    username?: string;
    image?: string;
    created_at?: string;
}

interface ColumnsResponse extends ResponseWithError {
    columns: any[];
}

export async function getUsersList(params: unknown) {
    return ApiService.fetchData<ResponseWithPagination<User>>({
        url: withAPI('/admin/users/list'),
        method: 'get',
        params,
    });
}

export async function getUsersColumns() {
    return ApiService.fetchData<ColumnsResponse>({
        url: withAPI('/admin/users/columns'),
        method: 'get',
    });
}