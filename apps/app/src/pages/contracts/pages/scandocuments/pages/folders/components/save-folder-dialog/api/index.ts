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

export function saveFolder(data: Record<string, any>) {
    return ApiService.fetchData<CreateFolderResponse>({
        url: withAPI("/contracts/scandocuments/folders/save"),
        method: "post",
        data: data,
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



export const createFolderSchema = z.object({
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

export type CreateFolderSchema = z.infer<typeof createFolderSchema>;