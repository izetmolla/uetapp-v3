import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";
import { USERS_LIST_BASE, type UsersStatsResponse } from "../../../api";

export async function getUsersStats() {
    return ApiService.fetchData<UsersStatsResponse>({
        url: withAPI(`${USERS_LIST_BASE}/stats`),
        method: "get",
    });
}
