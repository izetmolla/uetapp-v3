import ApiService, { withAPI, type ResponseWithError } from "@workspace/flowtrove/lib/network";
import z from "zod";

export interface OrgUnitMutationResponse extends ResponseWithError {
    success?: boolean;
    message?: string;
    org_unit?: Record<string, unknown>;
    deleted?: number;
}

export const orgUnitFormSchema = z.object({
    id: z.string().optional().nullable(),
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional().nullable(),
    unit: z.string().min(1, "Unit is required"),
});

export const orgUnitUpdateSchema = orgUnitFormSchema.omit({ unit: true }).extend({
    id: z.string().min(1, "Org unit id is required"),
});

export type OrgUnitFormSchema = z.infer<typeof orgUnitFormSchema>;
export type OrgUnitUpdateSchema = z.infer<typeof orgUnitUpdateSchema>;

/** @deprecated Use orgUnitFormSchema */
export const addOrgUnitSchema = orgUnitFormSchema;
/** @deprecated Use OrgUnitFormSchema */
export type AddOrgUnitSchema = OrgUnitFormSchema;

export function createOrgUnit(data: OrgUnitFormSchema) {
    const { id: _id, ...payload } = data;
    return ApiService.fetchDataBody<OrgUnitMutationResponse>({
        url: withAPI("/cadmin/orgunits/list"),
        method: "post",
        data: payload,
    });
}

export function updateOrgUnit(data: OrgUnitUpdateSchema) {
    const { id, ...payload } = data;
    return ApiService.fetchDataBody<OrgUnitMutationResponse>({
        url: withAPI(`/cadmin/orgunits/list/${id}`),
        method: "put",
        data: payload,
    });
}

export function deleteOrgUnits(ids: string[]) {
    return ApiService.fetchDataBody<OrgUnitMutationResponse>({
        url: withAPI("/cadmin/orgunits/list"),
        method: "delete",
        data: { ids },
    });
}

/** @deprecated Use createOrgUnit */
export function addOrgUnit(data: Record<string, unknown>) {
    return createOrgUnit(data as OrgUnitFormSchema);
}
