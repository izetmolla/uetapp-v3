/**
 * End-to-end tests for the request/response interceptor pipeline.
 *
 * These tests exist because the interceptor used to sign users out
 * on any unrecognized 401 - including transient ones from a slightly
 * stale access token - which is the bug we are guarding against here.
 *
 * Strategy:
 *   - Drive the interceptor through the public `BaseService` so we
 *     exercise the same code path the rest of the app uses.
 *   - Stub the underlying transport with a hand-rolled mock adapter
 *     (see `./test-utils`) to avoid an external mocking dependency.
 *   - Assert on store state transitions, not on the network layer
 *     internals, so refactors don't break the tests as long as the
 *     externally observable contract stays the same.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("sonner", () => ({
    toast: { error: vi.fn(), dismiss: vi.fn() },
}))

import useAuthorizationStore from "../../store/authorization"

// Importing from the barrel guarantees the interceptor side-effect
// is registered exactly once for the whole test run, mirroring how
// production code consumes the network layer.
import { BaseService } from "../network"

import { createMockAdapter, makeJwt, type MockedReply } from "./test-utils"

describe("BaseService interceptor", () => {
    const mock = createMockAdapter()
    let originalAdapter: typeof BaseService.defaults.adapter

    beforeEach(() => {
        useAuthorizationStore.setState({
            current_session: "",
            user: undefined,
            tokens: undefined,
            isSignedIn: false,
            sessions: [],
            redirectUrl: "",
            accessDenied: false,
        })
        originalAdapter = BaseService.defaults.adapter
        BaseService.defaults.adapter = mock.adapter
        mock.reset()
    })

    afterEach(() => {
        BaseService.defaults.adapter = originalAdapter
        mock.reset()
    })

    it("attaches the access token to outbound requests", async () => {
        const access = makeJwt(Date.now() + 5 * 60_000)
        useAuthorizationStore.getState().signInUser({
            tokens: { access_token: access, refresh_token: "rt" },
        })

        mock.push(() => ({ status: 200, data: { ok: true } }))
        await BaseService.get("/me")

        expect(mock.calls).toHaveLength(1)
        expect(mock.calls[0]?.headers.Authorization).toBe(`Bearer ${access}`)
    })

    it("proactively refreshes a stale access token before sending", async () => {
        const stale = makeJwt(Date.now() + 5_000) // inside skew window
        const fresh = makeJwt(Date.now() + 5 * 60_000)
        useAuthorizationStore.getState().signInUser({
            tokens: { access_token: stale, refresh_token: "rt" },
        })

        // First call out is the refresh (cft: t header), then the
        // real request with the fresh token.
        mock.push((req) => {
            expect(req.headers.cft).toBe("t")
            expect(req.headers.Authorization).toBe("Bearer rt")
            return { status: 200, data: fresh }
        })
        mock.push((req) => {
            expect(req.headers.Authorization).toBe(`Bearer ${fresh}`)
            return { status: 200, data: { ok: true } }
        })

        const res = await BaseService.get("/me")
        expect(res.status).toBe(200)
        expect(useAuthorizationStore.getState().tokens?.access_token).toBe(fresh)
    })

    it("collapses concurrent refreshes into a single round-trip", async () => {
        const stale = makeJwt(Date.now() + 5_000)
        const fresh = makeJwt(Date.now() + 5 * 60_000)
        useAuthorizationStore.getState().signInUser({
            tokens: { access_token: stale, refresh_token: "rt" },
        })

        let refreshCalls = 0
        type RefreshResolver = (reply: MockedReply) => void
        const resolverHolder: { fn: RefreshResolver | null } = { fn: null }
        // First scripted reply: the refresh. We delay it so all three
        // concurrent requests pile up behind the same in-flight
        // promise before we hand back the new token.
        mock.push(
            (req) =>
                new Promise<MockedReply>((resolve) => {
                    if (req.headers.cft === "t") {
                        refreshCalls++
                        resolverHolder.fn = resolve
                    } else {
                        resolve({ status: 200, data: { ok: true } })
                    }
                }),
        )
        mock.push(() => ({ status: 200, data: { req: 1 } }))
        mock.push(() => ({ status: 200, data: { req: 2 } }))
        mock.push(() => ({ status: 200, data: { req: 3 } }))

        const inflight = Promise.all([
            BaseService.get("/a"),
            BaseService.get("/b"),
            BaseService.get("/c"),
        ])
        // Give the request interceptors time to enter the
        // refresh-in-flight state.
        await new Promise((r) => setTimeout(r, 10))
        expect(resolverHolder.fn).not.toBeNull()
        resolverHolder.fn?.({ status: 200, data: fresh })

        await inflight
        expect(refreshCalls).toBe(1)
        expect(useAuthorizationStore.getState().tokens?.access_token).toBe(fresh)
    })

    it("retries the original request once on a 401 then succeeds", async () => {
        const access = makeJwt(Date.now() + 5 * 60_000)
        const fresh = makeJwt(Date.now() + 10 * 60_000)
        useAuthorizationStore.getState().signInUser({
            tokens: { access_token: access, refresh_token: "rt" },
        })

        mock.push(() => ({ status: 401, data: { code: "TOKEN_EXPIRED" } }))
        mock.push((req) => {
            // The retry should carry the refresh token and the
            // refresh-trigger header.
            expect(req.headers.cft).toBe("t")
            expect(req.headers.Authorization).toBe("Bearer rt")
            return { status: 200, data: fresh }
        })
        mock.push((req) => {
            expect(req.headers.Authorization).toBe(`Bearer ${fresh}`)
            return { status: 200, data: { ok: true } }
        })

        const res = await BaseService.get("/me")
        expect(res.status).toBe(200)
        expect(useAuthorizationStore.getState().isSignedIn).toBe(true)
    })

    it("signs the user out when refresh after a 401 also fails", async () => {
        const access = makeJwt(Date.now() + 5 * 60_000)
        useAuthorizationStore.getState().signInUser({
            tokens: { access_token: access, refresh_token: "rt" },
        })

        mock.push(() => ({ status: 401, data: { code: "TOKEN_EXPIRED" } }))
        // Refresh attempt: backend says the refresh token itself is
        // dead. The interceptor must surface this as a sign-out.
        mock.push(() => ({ status: 401, data: { code: "TOKEN_INVALID" } }))
        // The interceptor will fire a fire-and-forget sign-out call
        // to the backend; allow it to land harmlessly.
        mock.push(() => ({ status: 200, data: { message: "signed out" } }))

        await expect(BaseService.get("/me")).rejects.toBeDefined()
        expect(useAuthorizationStore.getState().isSignedIn).toBe(false)
        expect(useAuthorizationStore.getState().tokens).toBeUndefined()
    })

    it("does NOT sign the user out on a 403 (permission denied)", async () => {
        const access = makeJwt(Date.now() + 5 * 60_000)
        useAuthorizationStore.getState().signInUser({
            tokens: { access_token: access, refresh_token: "rt" },
        })

        mock.push(() => ({
            status: 403,
            data: { code: "INSUFFICIENT_PERMISSIONS", message: "no" },
        }))

        await expect(BaseService.get("/admin")).rejects.toBeDefined()
        expect(useAuthorizationStore.getState().isSignedIn).toBe(true)
        expect(useAuthorizationStore.getState().tokens?.access_token).toBe(access)
    })

    it("does NOT sign the user out on a 401 INSUFFICIENT_PERMISSIONS", async () => {
        // Some routes return 401 + INSUFFICIENT_PERMISSIONS for
        // resources that distinguish "logged out" from "logged in
        // but not allowed". Either way, refreshing the token won't
        // fix it and signing the user out would actively make their
        // UX worse.
        const access = makeJwt(Date.now() + 5 * 60_000)
        useAuthorizationStore.getState().signInUser({
            tokens: { access_token: access, refresh_token: "rt" },
        })

        mock.push(() => ({
            status: 401,
            data: { code: "INSUFFICIENT_PERMISSIONS" },
        }))

        await expect(BaseService.get("/admin")).rejects.toBeDefined()
        expect(useAuthorizationStore.getState().isSignedIn).toBe(true)
        expect(useAuthorizationStore.getState().accessDenied).toBe(true)
    })

    it("sets accessDenied on 500 INSUFFICIENT_PERMISSIONS (legacy wrong HTTP status)", async () => {
        const access = makeJwt(Date.now() + 5 * 60_000)
        useAuthorizationStore.getState().signInUser({
            tokens: { access_token: access, refresh_token: "rt" },
        })
        useAuthorizationStore.getState().clearAccessDenied()

        mock.push(() => ({
            status: 500,
            data: {
                code: "INSUFFICIENT_PERMISSIONS",
                message: "insufficient permissions",
                status: 403,
            },
        }))

        await expect(BaseService.get("/api/cadmin/users/list")).rejects.toBeDefined()
        expect(useAuthorizationStore.getState().isSignedIn).toBe(true)
        expect(useAuthorizationStore.getState().accessDenied).toBe(true)
    })

    it("sets accessDenied on 401 UNAUTHORIZED when signed in (role denied)", async () => {
        const access = makeJwt(Date.now() + 5 * 60_000)
        useAuthorizationStore.getState().signInUser({
            tokens: { access_token: access, refresh_token: "rt" },
        })
        useAuthorizationStore.getState().clearAccessDenied()

        mock.push(() => ({
            status: 401,
            data: { code: "UNAUTHORIZED", message: "unauthorized" },
        }))

        await expect(BaseService.get("/api/cadmin/users/list")).rejects.toBeDefined()
        expect(useAuthorizationStore.getState().isSignedIn).toBe(true)
        expect(useAuthorizationStore.getState().accessDenied).toBe(true)
    })

    it("sets accessDenied on 403 without signing out", async () => {
        const access = makeJwt(Date.now() + 5 * 60_000)
        useAuthorizationStore.getState().signInUser({
            tokens: { access_token: access, refresh_token: "rt" },
        })
        useAuthorizationStore.getState().clearAccessDenied()

        mock.push(() => ({
            status: 403,
            data: { message: "Forbidden" },
        }))

        await expect(BaseService.get("/admin")).rejects.toBeDefined()
        expect(useAuthorizationStore.getState().isSignedIn).toBe(true)
        expect(useAuthorizationStore.getState().accessDenied).toBe(true)
    })

    it("does NOT sign the user out on a network error", async () => {
        const access = makeJwt(Date.now() + 5 * 60_000)
        useAuthorizationStore.getState().signInUser({
            tokens: { access_token: access, refresh_token: "rt" },
        })

        mock.push(() => {
            throw Object.assign(new Error("Network Error"), { isAxiosError: true })
        })

        await expect(BaseService.get("/me")).rejects.toBeDefined()
        expect(useAuthorizationStore.getState().isSignedIn).toBe(true)
    })

    it("does not sign out twice when the same 401 fans out", async () => {
        // Simulates two pages mounted in parallel each issuing a
        // protected request. With a dead refresh token both come
        // back 401, and we want only one sign-out, not a thundering
        // herd.
        const access = makeJwt(Date.now() + 5 * 60_000)
        useAuthorizationStore.getState().signInUser({
            tokens: { access_token: access, refresh_token: "rt" },
        })

        mock.push(() => ({ status: 401, data: { code: "TOKEN_EXPIRED" } }))
        mock.push(() => ({ status: 401, data: { code: "TOKEN_EXPIRED" } }))
        mock.push(() => ({ status: 401, data: { code: "TOKEN_INVALID" } }))
        mock.push(() => ({ status: 200, data: "signed out" }))
        mock.push(() => ({ status: 200, data: "signed out" }))

        const results = await Promise.allSettled([
            BaseService.get("/a"),
            BaseService.get("/b"),
        ])
        expect(results.every((r) => r.status === "rejected")).toBe(true)
        expect(useAuthorizationStore.getState().isSignedIn).toBe(false)
    })
})
