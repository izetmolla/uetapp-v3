import { describe, expect, it } from "vitest";

import { getFiltersStateParser, getSortingStateParser } from "./parsers";

describe("getSortingStateParser", () => {
  const parser = getSortingStateParser(["name", "created_at"]);

  it("parses valid sorting JSON", () => {
    const value = JSON.stringify([
      { id: "name", desc: true },
      { id: "created_at", desc: false },
    ]);

    expect(parser.parse(value)).toEqual([
      { id: "name", desc: true },
      { id: "created_at", desc: false },
    ]);
  });

  it("rejects unknown column ids", () => {
    const value = JSON.stringify([{ id: "unknown", desc: true }]);
    expect(parser.parse(value)).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(parser.parse("not-json")).toBeNull();
  });

  it("round-trips via serialize", () => {
    const sorting = [{ id: "name", desc: false }];
    const serialized = parser.serialize(sorting);
    expect(parser.parse(serialized)).toEqual(sorting);
  });
});

describe("getFiltersStateParser", () => {
  const parser = getFiltersStateParser(["roles", "last_name"]);

  it("parses advanced filter with multi-select value array", () => {
    const value = JSON.stringify([
      {
        id: "roles",
        value: ["admin", "editor"],
        variant: "multiSelect",
        operator: "inArray",
        filterId: "f1",
      },
    ]);

    expect(parser.parse(value)).toEqual([
      {
        id: "roles",
        value: ["admin", "editor"],
        variant: "multiSelect",
        operator: "inArray",
        filterId: "f1",
      },
    ]);
  });

  it("parses text filter with iLike operator", () => {
    const value = JSON.stringify([
      {
        id: "last_name",
        value: "smith",
        variant: "text",
        operator: "iLike",
        filterId: "f2",
      },
    ]);

    expect(parser.parse(value)).toEqual([
      {
        id: "last_name",
        value: "smith",
        variant: "text",
        operator: "iLike",
        filterId: "f2",
      },
    ]);
  });

  it("parses isEmpty filter without value", () => {
    const value = JSON.stringify([
      {
        id: "last_name",
        variant: "text",
        operator: "isEmpty",
        filterId: "f3",
      },
    ]);

    expect(parser.parse(value)).toEqual([
      {
        id: "last_name",
        variant: "text",
        operator: "isEmpty",
        filterId: "f3",
      },
    ]);
  });

  it("parses isEmpty filter with empty string value", () => {
    const value = JSON.stringify([
      {
        id: "last_name",
        value: "",
        variant: "text",
        operator: "isEmpty",
        filterId: "f3b",
      },
    ]);

    expect(parser.parse(value)).toEqual([
      {
        id: "last_name",
        value: "",
        variant: "text",
        operator: "isEmpty",
        filterId: "f3b",
      },
    ]);
  });

  it("rejects filters for unknown columns", () => {
    const value = JSON.stringify([
      {
        id: "email",
        value: "a@b.com",
        variant: "text",
        operator: "eq",
        filterId: "f4",
      },
    ]);

    expect(parser.parse(value)).toBeNull();
  });

  it("rejects invalid operator values", () => {
    const value = JSON.stringify([
      {
        id: "roles",
        value: ["admin"],
        variant: "multiSelect",
        operator: "contains",
        filterId: "f5",
      },
    ]);

    expect(parser.parse(value)).toBeNull();
  });

  it("round-trips advanced filters via serialize", () => {
    const filters = [
      {
        id: "roles",
        value: ["admin"],
        variant: "multiSelect" as const,
        operator: "inArray" as const,
        filterId: "f6",
      },
    ];

    const serialized = parser.serialize(filters);
    expect(parser.parse(serialized)).toEqual(filters);
  });
});
