import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";
import { ROLES_LIST_BASE, type RoleMutationResponse } from "../../../api";

export function deleteRoles(ids: number[]) {
    return ApiService.fetchDataBody<RoleMutationResponse>({
        url: withAPI(ROLES_LIST_BASE),
        method: "delete",
        data: { ids },
    });
}
