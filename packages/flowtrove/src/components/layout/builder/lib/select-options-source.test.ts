import { describe, expect, it } from "vitest";
import {
    getStaticSelectOptions,
    hasRemoteSelectOptions,
    resolveSelectFetchConfig,
} from "./select-options-source";
import { isFetchOptions } from "../types/fetch-options";

describe("select-options-source", () => {
    it("detects object-form options as HTTP config", () => {
        const config = { url: "/api/countries", method: "get", params: { active: true } };
        expect(isFetchOptions(config)).toBe(true);
        expect(getStaticSelectOptions(config)).toEqual([]);
    });

    it("returns static arrays unchanged", () => {
        const options = [{ value: "al", label: "Albania" }];
        expect(isFetchOptions(options)).toBe(false);
        expect(getStaticSelectOptions(options)).toEqual(options);
    });

    it("resolveSelectFetchConfig prefers fetchOptions then object options", () => {
        expect(
            resolveSelectFetchConfig({
                fetchOptions: { url: "/a", method: "POST" },
                options: { url: "/b", method: "GET" },
            }),
        ).toEqual({ url: "/a", method: "POST" });

        expect(
            resolveSelectFetchConfig({
                options: { url: "/api/countries", method: "get", params: { q: 1 } },
            }),
        ).toEqual({ url: "/api/countries", method: "GET", params: { q: 1 } });
    });

    it("hasRemoteSelectOptions is true for object options", () => {
        expect(
            hasRemoteSelectOptions({
                options: { url: "/api/countries", method: "get" },
            }),
        ).toBe(true);
        expect(
            hasRemoteSelectOptions({
                options: [{ value: "x", label: "X" }],
            }),
        ).toBe(false);
    });
});
