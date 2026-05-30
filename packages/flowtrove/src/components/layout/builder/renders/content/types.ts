import type { LayoutInterpolationConfig } from "../../types/layout-interpolation";
import type { BaseLayoutItem, LayoutBuilderChildItem } from "../../types/base-layout";
import type { ContentSource } from "./content-source";

export type { ContentSource, ContentSourceDescriptor } from "./content-source";

/**
 * Content — single object scope for `{{ }}` interpolation (root value is a **plain object**, not an array).
 * Nested objects and arrays **on** that object are normal values: use `{{ user.ws.name }}`, `{{ items[0].sku }}`, or `{{ user?.profile?.bio }}` in strings.
 * `children` may be **any** layout item tree (cards, forms, `item-list`, etc.); `condition` is evaluated against the merged scope after interpolation.
 */
export type ContentItem = BaseLayoutItem & {
  type: "content";
  /** Key on runtime `data`, or descriptor with optional HTTP load via TanStack Query. */
  source?: ContentSource;
  /** Inline object when live `data[source]` is absent or not a plain object. */
  value?: Record<string, unknown>;
  /** Name of the object in `{{ content.title }}` style bindings (default `"content"`). */
  objectName?: string;
  /** Override `LayoutBuilder` interpolation for this block's template only. */
  interpolation?: LayoutInterpolationConfig;
  children?: LayoutBuilderChildItem[];
};
