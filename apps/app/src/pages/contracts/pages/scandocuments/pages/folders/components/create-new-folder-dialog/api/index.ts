import ApiService, { type ResponseWithError, withAPI } from "@workspace/flowtrove/lib/network";
import type { Folder } from "../../../api";
import z from "zod";


export interface CreateFolderParams {
    year: string;
    faculty_slug: string;
    level_slug: string;
    name: string;
}

export interface CreateFolderResponse extends ResponseWithError {
    success?: boolean;
    message?: string;
    folder?: Folder;
}

/** Validates input with Zod before calling the API. */
export function parseCreateFolderInput(data: unknown): CreateFolderSchema {
    return createFolderSchema.parse(data);
}

export function createFolder(params: CreateFolderParams) {
    const { year, faculty_slug, level_slug, name } = params;
    const body = parseCreateFolderInput({ name });

    return ApiService.fetchData<CreateFolderResponse>({
        url: withAPI("/contracts/scandocuments/folders"),
        method: "post",
        params: { year, faculty_slug, level_slug },
        data: body,
    });
}


export const createFolderSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, { message: "Name is required" })
        .max(255, { message: "Name must be at most 255 characters" }),
});

export type CreateFolderSchema = z.infer<typeof createFolderSchema>;