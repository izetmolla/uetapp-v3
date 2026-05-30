import { describe, expect, it } from "vitest";
import {
    buildConditionContext,
    evaluateCondition,
    getConditionValue,
} from "./utils";

describe("buildConditionContext", () => {
    it("resolves layout data paths", () => {
        const ctx = buildConditionContext({ profile: { title: "Engineer" } }, { firstName: "Jane" });
        expect(getConditionValue(ctx, "data.profile.title")).toBe("Engineer");
    });

    it("resolves form field paths", () => {
        const ctx = buildConditionContext({}, { newsletter: true, accountType: "business" });
        expect(getConditionValue(ctx, "form.newsletter")).toBe(true);
        expect(getConditionValue(ctx, "newsletter")).toBe(true);
        expect(getConditionValue(ctx, "accountType")).toBe("business");
    });

    it("prefers form values over layout data for bare paths", () => {
        const ctx = buildConditionContext({ newsletter: false }, { newsletter: true });
        expect(getConditionValue(ctx, "newsletter")).toBe(true);
    });
});

describe("evaluateCondition with form values", () => {
    it("shows field when checkbox is checked", () => {
        const ctx = buildConditionContext({}, { newsletter: true });
        expect(evaluateCondition("newsletter === true", ctx)).toBe(true);
        expect(evaluateCondition("newsletter", ctx)).toBe(true);
    });

    it("hides field when checkbox is unchecked", () => {
        const ctx = buildConditionContext({}, { newsletter: false });
        expect(evaluateCondition("newsletter === true", ctx)).toBe(false);
        expect(evaluateCondition("newsletter", ctx)).toBe(false);
    });

    it("shows field when radio/select value matches", () => {
        const ctx = buildConditionContext({}, { accountType: "business" });
        expect(evaluateCondition("form.accountType === 'business'", ctx)).toBe(true);
        expect(evaluateCondition("accountType === 'personal'", ctx)).toBe(false);
    });

    it("still supports layout data conditions", () => {
        const ctx = buildConditionContext({ showBanner: true }, {});
        expect(evaluateCondition("data.showBanner === true", ctx)).toBe(true);
    });
});
