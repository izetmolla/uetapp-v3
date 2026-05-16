import { withWs, type WithPagination } from "@workspace/flowtrove/lib/network";
import ApiService, { withAPI } from "@workspace/flowtrove/lib/network";
import type { Entity } from "../types";

/** Root segment for entities list queries — use with `invalidateQueries` to refresh every list variant. */
export const ENTITIES_LIST_QUERY_PREFIX = ["entities-list"] as const;

export interface GetEntitiesResponse {
    entities: WithPagination<Entity>;
}
export function getEntities(params: Record<string, unknown>) {
    return ApiService.fetchDataBody<GetEntitiesResponse>({
        url: withAPI('/entities/list'),
        method: "get",
        params: withWs(params),
    });
}