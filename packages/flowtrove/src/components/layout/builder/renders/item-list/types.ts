import type { LayoutInterpolationConfig } from "../../types/layout-interpolation";
import type { BaseLayoutItem, LayoutBuilderChildItem } from "../../types/base-layout";

/**
 * Item list — repeats child layout items for each row in a data array.
 * String fields in the template may use `{{ title }}`, `{{ price * 2 }}`, etc.
 */
export type ItemListItem = BaseLayoutItem & {
  type: "item-list";
  /** Key on `LayoutBuilder` runtime `data` for the array to iterate. */
  source?: string;
  /** Static rows (e.g. designer preview) when live `data[source]` is missing or empty. */
  list?: unknown[];
  /** Binding name for the row object in `{{ }}` scope (default `"item"`). */
  itemName?: string;
  /** Override `LayoutBuilder` interpolation for this list's row template only. */
  interpolation?: LayoutInterpolationConfig;
  children?: LayoutBuilderChildItem[];
};
