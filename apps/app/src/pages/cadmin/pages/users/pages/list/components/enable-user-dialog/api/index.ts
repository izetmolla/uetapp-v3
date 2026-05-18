import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";
import { USERS_LIST_BASE, type UserMutationResponse } from "../../../api";

export function enableUsers(ids: string[]) {
    return ApiService.fetchDataBody<UserMutationResponse>({
        url: withAPI(`${USERS_LIST_BASE}/enable`),
        method: "post",
        data: { ids },
    });
}
