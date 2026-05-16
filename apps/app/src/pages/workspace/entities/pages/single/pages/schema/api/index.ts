import type { Column, DataType, Entity } from "@/pages/workspace/entities/types";
import ApiService, { withAPI, withWs } from "@workspace/flowtrove/lib/network";


export interface GetEntitySchemaResponse {
    attributes: Column[];
    entity: Entity;
}

export function getEntitySchema(params: Record<string, unknown>): Promise<GetEntitySchemaResponse> {
    return ApiService.fetchDataBody<GetEntitySchemaResponse>({
        url: withAPI(`/entities/single-schema`),
        method: "get",
        params: withWs(params),
    });
}

export const DATA_TYPES: DataType[] = [
    "VARCHAR(50)",
    "VARCHAR(255)",
    "TEXT",
    "BOOLEAN",
    "INTEGER",
    "TIMESTAMP WITH TIME ZONE",
    "UUID",
];
