/**
 * Tests for the pure JWT helpers in `./jwt.ts`.
 *
 * These tests are intentionally kept free of axios, the auth store
 * and any toast/UI mocks: the helpers are pure and any failure
 * surfaced here is a real regression in the parsing logic.
 */

import { describe, expect, it } from "vitest"

import { isAccessTokenStale, isValidJwtFormat } from "./jwt"
import { makeJwt } from "./test-utils"

describe("isValidJwtFormat", () => {
    it("accepts well-formed JWTs", () => {
        expect(isValidJwtFormat(makeJwt(Date.now() + 60_000))).toBe(true)
    })

    it("rejects non-JWT inputs", () => {
        expect(isValidJwtFormat(undefined)).toBe(false)
        expect(isValidJwtFormat("")).toBe(false)
        expect(isValidJwtFormat("not.a.jwt")).toBe(false)
    })
})

describe("isAccessTokenStale", () => {
    it("returns true for an already-expired token", () => {
        expect(isAccessTokenStale(makeJwt(Date.now() - 10_000))).toBe(true)
    })

    it("returns true for a token expiring inside the skew window", () => {
        // 5 seconds left; default skew is 60s → considered stale.
        expect(isAccessTokenStale(makeJwt(Date.now() + 5_000))).toBe(true)
    })

    it("returns false for a healthy token", () => {
        expect(isAccessTokenStale(makeJwt(Date.now() + 5 * 60_000))).toBe(false)
    })

    it("returns false on bad input rather than throwing", () => {
        expect(isAccessTokenStale(undefined)).toBe(false)
        expect(isAccessTokenStale("garbage")).toBe(false)
    })
})
