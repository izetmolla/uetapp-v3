import ApiService, { type ResponseWithError, withAPI } from "@workspace/flowtrove/lib/network";
import type { Folder } from "../../../api";
import z from "zod";

export interface SaveFolderResponse extends ResponseWithError {
    success?: boolean;
    message?: string;
    folder?: Folder;
}

export function parseSaveFolderInput(data: unknown): SaveFolderSchema {
    return saveFolderSchema.parse(data);
}

export function saveFolder(data: SaveFolderSchema) {
    const body = parseSaveFolderInput(data);
    return ApiService.fetchData<SaveFolderResponse>({
        url: withAPI("/contracts/scandocuments/folders/save"),
        method: "post",
        data: body,
    });
}

export const saveFolderSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, { message: "Name is required" })
        .max(255, { message: "Name must be at most 255 characters" }),
    id: z.string().optional(),
    year: z.string().optional(),
    level_slug: z.string().optional(),
    faculty_slug: z.string().optional(),
});

export type SaveFolderSchema = z.infer<typeof saveFolderSchema>;
