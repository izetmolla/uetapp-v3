import ApiService, { withWs, withAPI } from "@workspace/flowtrove/lib/network";
import z from "zod";


export interface AddDomainModalDataTypes {
    domain?: string;
    success?: boolean;
    error?: boolean;
    message?: string;
    code?: string;
    details?: unknown;
}

export function addDomain(data: Record<string, unknown>) {
    return ApiService.fetchDataBody<AddDomainModalDataTypes>({
        url: withAPI('/domains/create'),
        method: 'post',
        data: withWs(data),
    });
}
export const addDomainSchema = z.object({
    domain: z
        .string()
        .trim()
        .min(1, "Domain is required")
        .regex(
            /^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/,
            "Enter a valid domain like example.com",
        ),
});

export type AddDomainSchema = z.infer<typeof addDomainSchema>;


export interface CheckDomainAvailabilityDataTypes {
    domain?: string;
    is_available?: boolean;
    message?: string;
    success?: boolean;
    error?: boolean;
    code?: string;
    details?: unknown;
}
export function checkDomainAvailability(data: Record<string, unknown>) {
    return ApiService.fetchDataBody<CheckDomainAvailabilityDataTypes>({
        url: withAPI('/domains/check-availability'),
        method: 'post',
        data: withWs(data),
    });
}