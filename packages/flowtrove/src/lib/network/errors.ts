/**
 * Helpers for inspecting and formatting backend error responses.
 *
 * The backend has two distinct error shapes the UI has to deal with:
 *
 *   1. HTTP 4xx/5xx with a JSON body like
 *      `{ error: true, message?: string, code?: string }`.
 *   2. HTTP 200 with an "in-band" error object in the same shape -
 *      this happens for legacy endpoints that always reply 200.
 *
 * These helpers normalize both into a single string suitable for a
 * toast.
 */

import axios from "axios"

/**
 * Wraps an upstream error and a response body into a single `Error`
 * the UI can throw. Returns `null` when there is no error to surface.
 */
export const withError = (error: Error | null, data: unknown): Error | null => {
    if (error) return error
    if ((data as { error?: unknown })?.error) {
        return new Error((data as { message?: string }).message)
    }
    return null
}

/** Backend may respond with HTTP 200 and `{ error: true, message?: string }`. */
export function isApiErrorBody(body: unknown): boolean {
    if (!body || typeof body !== "object") return false
    const err = (body as Record<string, unknown>).error
    return err === true || err === "true" || err === 1
}

/**
 * Extracts a toast-friendly message from a `{ error, message?, code? }`
 * envelope. Falls back to the supplied default when no usable string
 * is present.
 */
export function getApiErrorMessageFromBody(body: unknown, fallback: string): string {
    if (!body || typeof body !== "object") return fallback
    const o = body as Record<string, unknown>
    const msg = o.message
    if (typeof msg === "string") {
        const t = msg.trim()
        if (t.length > 0) return t
    } else if (msg != null && typeof msg !== "object" && typeof msg !== "undefined") {
        const t = String(msg).trim()
        if (t.length > 0) return t
    }
    const code = o.code
    if (typeof code === "string") {
        const t = code.trim()
        if (t.length > 0) return t
    }
    return fallback
}

/**
 * Message for failed requests (4xx/5xx, network errors) - safe for
 * toast copy. Strips HTML, truncates to 280 chars, and falls back
 * to the supplied default for empty/unknown error shapes.
 */
export function getRequestErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const data = error.response?.data

        if (data != null && typeof data === "object" && !Array.isArray(data)) {
            const msg = getApiErrorMessageFromBody(data, "")
            if (msg) return msg
        }
        if (typeof data === "string" && data.trim().length > 0) {
            const text = data.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
            if (text.length > 0) return text.length > 280 ? `${text.slice(0, 280)}…` : text
        }
        if (status === 404) {
            return error.response?.statusText?.trim() || "Not found"
        }
        if (typeof error.message === "string" && error.message.trim().length > 0) {
            return error.message.trim()
        }
    }
    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message.trim()
    }
    return fallback
}
