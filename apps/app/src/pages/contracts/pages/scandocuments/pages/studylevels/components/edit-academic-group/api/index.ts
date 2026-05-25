import ApiService, {type ResponseWithError, withAPI } from "@workspace/flowtrove/lib/network";
import { z } from "zod";


interface EditStudyLevelGroupResponse extends ResponseWithError {

}


export function editAcademicGroup(data: Record<string, unknown>) {
    return ApiService.fetchData<EditStudyLevelGroupResponse>({
        url: withAPI('/contracts/scandocuments/studylevels/create-group'),
        method: 'post',
        data,
    });
}

export const editStudyLevelGroupSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, { message: "Name is required" })
        .max(255, { message: "Name must be at most 255 characters" }),
    id: z.string().optional(),
    studyLevels: z
        .array(z.string())
        .min(1, { message: "Select at least one study level" }),
});

export type EditStudyLevelGroupSchema = z.infer<typeof editStudyLevelGroupSchema>;