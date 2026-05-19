import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";
import { ROLES_LIST_BASE, type RoleMutationResponse } from "../../../api";

export function enableRoles(ids: number[]) {
    return ApiService.fetchDataBody<RoleMutationResponse>({
        url: withAPI(`${ROLES_LIST_BASE}/enable`),
        method: "post",
        data: { ids },
    });
}
