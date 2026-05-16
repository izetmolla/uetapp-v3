import type { Column, Entity } from "@/pages/workspace/entities/types";
import ApiService, { withAPI, withWs, type WithPagination } from "@workspace/flowtrove/lib/network";
import type { Row } from "../../store";




export interface GetSingleEntityGeneralResponse {
    entity: Entity;
    attributes: Column[];
    records: WithPagination<Row>;
}
export function getSingleEntityGeneral(params: Record<string, unknown>) {
    return ApiService.fetchDataBody<GetSingleEntityGeneralResponse>({
        url: withAPI('/entities/single-content'),
        method: "get",
        params: withWs(params),
    });
}