import ApiService, { withAPI, withWs } from "@workspace/flowtrove/lib/network";
import { z } from "zod";


export interface AddEndpointGroupDialogDataTypes {
    name?: string;
    success?: boolean;
    error?: boolean;
    message?: string;
    code?: string;
    details?: unknown;
}



export function addEndpointGroup(data: AddEndpointGroupSchema): Promise<AddEndpointGroupDialogDataTypes> {
    return ApiService.fetchDataBody<AddEndpointGroupDialogDataTypes>({
        url: withAPI('/endpoints/create-group'),
        method: 'post',
        data: withWs({
            ...data,
            path:  (data?.path_prefix ?? "") + (data.path.startsWith("/") ? data.path : `/${data.path}`).replace("//", "")
        }),
    });
}
export const addEndpointGroupSchema = z.object({
    path: z.string().min(1),
    domain_id: z.string().min(1),
    name: z.string().min(1),
    group_id: z.string().optional(),
    category: z.enum(["web", "api"]),
    parent_id: z.string().optional(),
    visibility: z.enum(["public", "private"]),
    path_prefix: z.string().optional(),
});

export type AddEndpointGroupSchema = z.infer<typeof addEndpointGroupSchema>;