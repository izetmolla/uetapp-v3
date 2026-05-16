/** How to render `{{ expr }}` when the value is nullish, false, or a non-primitive for string output. */
export type LayoutInterpolationNullish = "empty" | "placeholder" | "expression";

export type LayoutInterpolationConfig = {
  /**
   * When an expression yields `null`, `undefined`, `false`, or a value that cannot
   * be shown as plain text in a string (objects, arrays).
   * - `empty` — substitute nothing (default; same as omitting config).
   * - `placeholder` — use `placeholder` (default `""` if unset).
   * - `expression` — show the trimmed expression text (debug / “which field”).
   */
  nullish?: LayoutInterpolationNullish;
  /** Used when `nullish` is `"placeholder"`. */
  placeholder?: string;
};
