import ApiService, { withAPI, withWs, type ResponseWithError } from "@workspace/flowtrove/lib/network";
import { z } from "zod";


export interface AddEndpointPathDialogDataTypes extends ResponseWithError {
  success: boolean;
}



export function addEndpointPath(data: AddEndpointPathSchema): Promise<AddEndpointPathDialogDataTypes> {
    return ApiService.fetchDataBody<AddEndpointPathDialogDataTypes>({
        url: withAPI('/endpoints/create-endpoint'),
        method: 'post',
        data: withWs({
            ...data,
            path:  (data?.path_prefix ?? "") + (data.path.startsWith("/") ? data.path : `/${data.path}`).replace("//", "")
        }),
    });
}
export const addEndpointPathSchema = z.object({
    path: z.string().min(1),
    domain_id: z.string().min(1),
    name: z.string().min(1),
    group_id: z.string().optional(),
    category: z.enum(["web", "api"]),
    parent_id: z.string().optional(),
    visibility: z.enum(["public", "private"]),
    method: z.enum(["ALL", "GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "CONNECT", "TRACE"]),
    path_prefix: z.string().optional(),
});
export type AddEndpointPathSchema = z.infer<typeof addEndpointPathSchema>;