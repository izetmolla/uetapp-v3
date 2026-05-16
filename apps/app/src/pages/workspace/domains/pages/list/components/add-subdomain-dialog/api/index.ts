import ApiService, { withAPI, withWs, type ResponseWithError } from "@workspace/flowtrove/lib/network";
import z from "zod";

const SUBDOMAIN_LABEL_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export interface AddSubdomainDialogDataTypes extends ResponseWithError {
    success?: boolean;
    message?: string;
}

export const addSubdomainSchema = z.object({
    label: z
        .string()
        .trim()
        .min(1, "Label is required")
        .regex(SUBDOMAIN_LABEL_REGEX, "Use lowercase letters, numbers, and hyphens only."),
});

export type AddSubdomainSchema = z.infer<typeof addSubdomainSchema>;

export function addSubdomain(data: Record<string, unknown>) {
    return ApiService.fetchDataBody<AddSubdomainDialogDataTypes>({
        url: withAPI("/domains/subdomain-add"),
        method: "post",
        data: withWs(data),
    });
}
