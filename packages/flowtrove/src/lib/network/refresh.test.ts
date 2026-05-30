/**
 * Targeted tests for the single-flight `refreshAccessToken` helper.
 *
 * The interceptor tests in `./interceptors.test.ts` already cover
 * the happy path through the response interceptor. These tests
 * focus on the edge cases of the refresh helper itself - mainly
 * that a failed refresh leaves the store untouched and never
 * throws, so the caller can safely `await` it.
 */

import type { InternalAxiosRequestConfig } from "axios"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("sonner", () => ({
    toast: { error: vi.fn(), dismiss: vi.fn() },
}))

import useAuthorizationStore from "../../store/authorization"

import { BaseService, refreshAccessToken } from "../network"

import { createMockAdapter } from "./test-utils"

describe("refreshAccessToken (single-flight)", () => {
    const mock = createMockAdapter()
    let originalAdapter: typeof BaseService.defaults.adapter

    beforeEach(() => {
        useAuthorizationStore.setState({
            current_session: "user-1",
            user: undefined,
            tokens: { access_token: "old", refresh_token: "rt" },
            isSignedIn: true,
            sessions: [
                {
                    id: "user-1",
                    user: {
                        id: "user-1",
                        email: "u@test",
                        created_at: "",
                        roles: [],
                    },
                    tokens: { access_token: "old", refresh_token: "rt" },
                },
            ],
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

    it("returns null and leaves the store untouched when refresh fails", async () => {
        mock.push(() => ({ status: 401, data: { code: "TOKEN_INVALID" } }))

        const cfg = {
            method: "get",
            url: "/me",
            baseURL: BaseService.defaults.baseURL,
            headers: {},
        } as unknown as InternalAxiosRequestConfig

        const result = await refreshAccessToken(cfg, "rt")
        expect(result).toBeNull()
        expect(useAuthorizationStore.getState().tokens?.access_token).toBe("old")
    })
})
