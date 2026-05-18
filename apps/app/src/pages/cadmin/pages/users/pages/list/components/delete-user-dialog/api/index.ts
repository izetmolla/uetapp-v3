import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";
import { USERS_LIST_BASE, type UserMutationResponse } from "../../../api";

export function deleteUsers(ids: string[]) {
    return ApiService.fetchDataBody<UserMutationResponse>({
        url: withAPI(USERS_LIST_BASE),
        method: "delete",
        data: { ids },
    });
}
