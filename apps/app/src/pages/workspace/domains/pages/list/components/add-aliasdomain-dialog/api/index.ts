import ApiService, { withAPI, withWs, type ResponseWithError } from "@workspace/flowtrove/lib/network";
import z from "zod";

export interface AddAliasDomainDialogDataTypes extends ResponseWithError {
    success?: boolean;
    message?: string;
}

export const addAliasDomainSchema = z.object({
    domain: z
        .string()
        .trim()
        .min(1, "Domain is required")
        .regex(
            /^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/,
            "Enter a valid domain like example.com",
        ),
});

export type AddAliasDomainSchema = z.infer<typeof addAliasDomainSchema>;

export function addAliasDomain(data: Record<string, unknown>) {
    return ApiService.fetchDataBody<AddAliasDomainDialogDataTypes>({
        url: withAPI("/domains/alias-add"),
        method: "post",
        data: withWs(data),
    });
}
