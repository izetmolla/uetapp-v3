import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";
import { ROLES_LIST_BASE, type RoleMutationResponse } from "../../../api";

export function disableRoles(ids: number[]) {
    return ApiService.fetchDataBody<RoleMutationResponse>({
        url: withAPI(`${ROLES_LIST_BASE}/disable`),
        method: "post",
        data: { ids },
    });
}
