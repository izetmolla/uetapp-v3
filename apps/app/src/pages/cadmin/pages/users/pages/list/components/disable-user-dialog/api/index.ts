import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";
import { USERS_LIST_BASE, type UserMutationResponse } from "../../../api";

export function disableUsers(ids: string[]) {
    return ApiService.fetchDataBody<UserMutationResponse>({
        url: withAPI(`${USERS_LIST_BASE}/disable`),
        method: "post",
        data: { ids },
    });
}
