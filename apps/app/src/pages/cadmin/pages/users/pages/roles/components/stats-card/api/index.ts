import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";
import { ROLES_LIST_BASE, type RolesStatsResponse } from "../../../api";

export async function getRolesStats() {
    return ApiService.fetchData<RolesStatsResponse>({
        url: withAPI(`${ROLES_LIST_BASE}/stats`),
        method: "get",
    });
}
