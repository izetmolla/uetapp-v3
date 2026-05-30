import { describe, expect, it } from "vitest";
import {
  deepInterpolate,
  deepInterpolateLayoutItems,
  mergeInterpolationConfig,
} from "./expression-template";
import type { LayoutBuilderItem } from "../types/items";

describe("expression-template", () => {
  it("interpolates {{ expr }} in strings", () => {
    expect(deepInterpolate("Hello {{ name }}", { name: "Ada" })).toBe("Hello Ada");
  });

  it("leaves type field untouched on layout items", () => {
    const items: LayoutBuilderItem[] = [
      {
        type: "long-text",
        id: "t1",
        text: "{{ label }}",
      },
    ];
    const out = deepInterpolateLayoutItems(items, { label: "ok" });
    expect(out[0]).toEqual({ type: "long-text", id: "t1", text: "ok" });
  });

  it("does not pre-interpolate item-list children templates", () => {
    const items: LayoutBuilderItem[] = [
      {
        type: "item-list",
        id: "list",
        source: "rows",
        children: [{ type: "long-text", id: "row", text: "{{ title }}" }],
      },
    ];
    const out = deepInterpolateLayoutItems(items, { title: "outer" });
    expect((out[0] as { children?: LayoutBuilderItem[] }).children?.[0]).toEqual({
      type: "long-text",
      id: "row",
      text: "{{ title }}",
    });
  });

  it("interpolates sibling fields on item-list node", () => {
    const items: LayoutBuilderItem[] = [
      {
        type: "item-list",
        id: "list",
        source: "rows",
        className: "list-{{ variant }}",
        children: [],
      },
    ];
    const out = deepInterpolateLayoutItems(items, { variant: "compact" });
    expect((out[0] as { className?: string }).className).toBe("list-compact");
  });

  it("uses placeholder mode for missing values", () => {
    expect(
      deepInterpolate("A{{ missing }}B", {}, { nullish: "placeholder", placeholder: "—" }),
    ).toBe("A—B");
  });

  it("uses expression mode for missing values", () => {
    expect(deepInterpolate("X{{ noKey }}Y", {}, { nullish: "expression" })).toBe("XnoKeyY");
  });

  it("mergeInterpolationConfig prefers override", () => {
    expect(
      mergeInterpolationConfig(
        { nullish: "empty", placeholder: "a" },
        { nullish: "placeholder", placeholder: "b" },
      ),
    ).toEqual({ nullish: "placeholder", placeholder: "b" });
  });
});
