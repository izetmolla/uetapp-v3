import type { UseFormReturn } from "react-hook-form";
import type { ZodIssue } from "zod";
import { toast } from "sonner";

const BODY_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export type ApiErrorResponse = {
    message: string;
    details?: { field?: string };
};

export function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
    return (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof (data as ApiErrorResponse).message === "string"
    );
}

export function extractAxiosErrorData(error: unknown): unknown {
    if (typeof error === "object" && error !== null && "response" in error) {
        return (error as { response?: { data?: unknown } }).response?.data;
    }
    return undefined;
}

/** Map Zod issues to RHF field errors (supports nested paths like experience.0.company). */
export function applyZodErrors(
    form: UseFormReturn<Record<string, unknown>>,
    issues: ZodIssue[],
) {
    for (const issue of issues) {
        const path = issue.path.map(String).join(".");
        if (!path) continue;
        form.setError(path as never, { type: "manual", message: issue.message });
    }
}

export function handleFormSubmitError(
    error: unknown,
    form: UseFormReturn<Record<string, unknown>>,
    fieldNames: string[],
    options: {
        showErrorAsToast?: boolean;
        setFormError: (message: string | null) => void;
    },
) {
    const responseData = extractAxiosErrorData(error);

    if (isApiErrorResponse(responseData)) {
        const { message, details } = responseData;
        const field = details?.field;

        if (options.showErrorAsToast) {
            toast.error(message);
            return;
        }

        if (field && fieldNames.includes(field)) {
            form.setError(field, { type: "server", message });
            return;
        }

        options.setFormError(message);
        return;
    }

    const fallbackMessage =
        typeof responseData === "object" &&
        responseData !== null &&
        "message" in responseData
            ? String((responseData as { message: unknown }).message)
            : error instanceof Error
              ? error.message
              : "Request failed";

    if (options.showErrorAsToast) {
        toast.error(fallbackMessage);
        return;
    }

    options.setFormError(fallbackMessage);
}

export function usesRequestBody(method: string): boolean {
    return BODY_METHODS.has(method.toUpperCase());
}
