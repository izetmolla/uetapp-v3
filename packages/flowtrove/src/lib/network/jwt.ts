/**
 * Pure JWT helpers used by the auth pipeline.
 *
 * The frontend never verifies the signature - that's the backend's
 * job - so we only ever read the payload. Keeping these functions
 * pure (no I/O, no globals) makes them trivial to unit-test and
 * reuse outside the interceptor.
 */

import { jwtDecode } from "jwt-decode"

import { REFRESH_SKEW_MS } from "./constants"

interface AccessTokenPayload {
    exp?: number
}

/**
 * Type guard for "this string is a syntactically valid JWT we can
 * decode". Empty strings, undefined, and arbitrary text all fall
 * through as `false` rather than throwing.
 */
export function isValidJwtFormat(token?: string): token is string {
    if (typeof token !== "string" || token.length === 0) return false
    try {
        jwtDecode<AccessTokenPayload>(token)
        return true
    } catch {
        return false
    }
}

/** Returns the JWT `exp` claim in milliseconds, or null when unparseable. */
export function getTokenExpiryMs(token?: string): number | null {
    if (!isValidJwtFormat(token)) return null
    try {
        const decoded = jwtDecode<AccessTokenPayload>(token)
        if (typeof decoded.exp !== "number") return null
        return decoded.exp * 1000
    } catch {
        return null
    }
}

/**
 * True when the token is expired right now or will be within
 * `skewMs` milliseconds. The skew lets us refresh *before* the
 * server would reject the request, which is the only safe pre-flight
 * check for a wall-clock-validated JWT.
 */
export function isAccessTokenStale(
    token: string | undefined,
    skewMs: number = REFRESH_SKEW_MS,
): boolean {
    const exp = getTokenExpiryMs(token)
    if (exp === null) return false
    return exp - skewMs <= Date.now()
}
