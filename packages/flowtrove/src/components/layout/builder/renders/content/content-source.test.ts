import { describe, expect, it } from "vitest";
import {
  getContentDataKey,
  getContentFetchSpec,
  resolveContentObjectFromDataKey,
} from "./content-source";

describe("content-source helpers", () => {
  it("getContentDataKey reads string and object.source", () => {
    expect(getContentDataKey("  page  ")).toBe("page");
    expect(getContentDataKey({ source: "page" })).toBe("page");
    expect(getContentDataKey({ api: "/x" })).toBeUndefined();
    expect(getContentDataKey(undefined)).toBeUndefined();
  });

  it("getContentFetchSpec returns undefined without api", () => {
    expect(getContentFetchSpec("page")).toBeUndefined();
    expect(getContentFetchSpec({ source: "page" })).toBeUndefined();
  });

  it("getContentFetchSpec normalizes method and trims api", () => {
    expect(
      getContentFetchSpec({
        api: " /path ",
        method: "post",
        body: { a: 1 },
      }),
    ).toEqual({ api: "/path", method: "POST", body: { a: 1 } });
  });

  it("resolveContentObjectFromDataKey prefers data then value", () => {
    expect(
      resolveContentObjectFromDataKey("p", { v: 1 }, { p: { a: 2 } }),
    ).toEqual({ a: 2 });
    expect(resolveContentObjectFromDataKey(undefined, { v: 1 }, {})).toEqual({ v: 1 });
    expect(resolveContentObjectFromDataKey("missing", undefined, {})).toBeNull();
  });
});
