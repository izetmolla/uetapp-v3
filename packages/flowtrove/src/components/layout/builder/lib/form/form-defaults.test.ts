import { describe, expect, it } from "vitest";
import {
    buildDefaultValues,
    getFormFieldNames,
    mergeFormSubmitPayload,
    resolveFormDefaultValues,
} from "./index";
import type { LayoutBuilderChildItem } from "../../types/base-layout";

describe("form defaults and field collection", () => {
    const nestedFormChildren: LayoutBuilderChildItem[] = [
        {
            type: "card",
            id: "card",
            title: "Profile",
            children: [
                {
                    type: "input",
                    id: "name",
                    name: "displayName",
                    label: "Name",
                },
                {
                    type: "select",
                    id: "country",
                    name: "country",
                    label: "Country",
                    defaultValue: "al",
                    options: [
                        { value: "al", label: "Albania" },
                        { value: "de", label: "Germany" },
                    ],
                },
            ],
            footer: [
                {
                    type: "checkbox",
                    id: "terms",
                    name: "acceptTerms",
                    label: "Accept terms",
                    defaultChecked: true,
                },
            ],
        },
    ];

    it("collects nested fields including card footer", () => {
        expect(getFormFieldNames(nestedFormChildren).sort()).toEqual([
            "acceptTerms",
            "country",
            "displayName",
        ]);
    });

    it("buildDefaultValues respects defaultValue, defaultChecked, and options fields", () => {
        expect(buildDefaultValues(nestedFormChildren)).toEqual({
            displayName: "",
            country: "al",
            acceptTerms: true,
        });
    });

    it("resolveFormDefaultValues merges data[source] over JSON defaults", () => {
        expect(
            resolveFormDefaultValues(nestedFormChildren, {
                source: "profile",
                data: {
                    profile: {
                        displayName: "Ada",
                        country: "de",
                    },
                },
            }),
        ).toEqual({
            displayName: "Ada",
            country: "de",
            acceptTerms: true,
        });
    });

    it("resolveFormDefaultValues merges item.value and top-level data keys", () => {
        expect(
            resolveFormDefaultValues(nestedFormChildren, {
                value: { displayName: "Static" },
                data: { acceptTerms: false },
            }),
        ).toEqual({
            displayName: "Static",
            country: "al",
            acceptTerms: false,
        });
    });

    it("mergeFormSubmitPayload merges data[source] and includeDataKeys", () => {
        expect(
            mergeFormSubmitPayload(
                { name: "Updated" },
                {
                    source: "config",
                    data: {
                        id: "42",
                        config: {
                            id: "42",
                            name: "Original",
                            bucket: "storage1",
                        },
                    },
                    includeDataKeys: ["id"],
                },
            ),
        ).toEqual({
            id: "42",
            name: "Updated",
            bucket: "storage1",
        });
    });

    it("resolveFormDefaultValues prefers data[source] over item.value", () => {
        expect(
            resolveFormDefaultValues(nestedFormChildren, {
                source: "profile",
                value: { displayName: "Static", country: "al" },
                data: {
                    profile: {
                        displayName: "From API",
                        country: "de",
                    },
                },
            }),
        ).toEqual({
            displayName: "From API",
            country: "de",
            acceptTerms: true,
        });
    });
});
