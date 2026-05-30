import type { LayoutBuilderItem } from "../types/items";
import type { LayoutInterpolationConfig } from "../types/layout-interpolation";

export type {
  LayoutInterpolationConfig,
  LayoutInterpolationNullish,
} from "../types/layout-interpolation";

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/** Shallow merge: `override` wins; use for per-`content` / per-`item-list` on top of `LayoutBuilder` defaults. */
export function mergeInterpolationConfig(
  base: LayoutInterpolationConfig | undefined,
  override: LayoutInterpolationConfig | undefined,
): LayoutInterpolationConfig | undefined {
  if (!base && !override) return undefined;
  return { ...base, ...override };
}

function isUnusableForString(out: unknown): boolean {
  if (out === null || out === undefined || out === false) return true;
  if (typeof out === "object") return true;
  return false;
}

function replacementForMissingInterpolation(
  expr: string,
  options: LayoutInterpolationConfig | undefined,
): string {
  const mode = options?.nullish ?? "empty";
  if (mode === "placeholder") return options?.placeholder ?? "";
  if (mode === "expression") return expr;
  return "";
}

function evaluateExpression(expr: string, context: Record<string, unknown>): unknown {
  try {
    const keys = Object.keys(context).filter((k) => IDENT.test(k));
    const body = `try { return (${expr}); } catch (_e) { return undefined; }`;
    const fn = new Function(...keys, body);
    return fn(...keys.map((k) => context[k]));
  } catch {
    return "";
  }
}

function interpolateString(
  value: string,
  context: Record<string, unknown>,
  options: LayoutInterpolationConfig | undefined,
): string {
  return value.replace(/\{\{(.*?)\}\}/g, (_, raw: string) => {
    const expr = raw.trim();
    const out = evaluateExpression(expr, context);
    if (isUnusableForString(out)) {
      return replacementForMissingInterpolation(expr, options);
    }
    return String(out);
  });
}

/** Walk layout JSON and replace `{{ expr }}` in every string field (except `type`). */
export function deepInterpolate(
  value: unknown,
  context: Record<string, unknown>,
  options?: LayoutInterpolationConfig,
): unknown {
  if (typeof value === "string") {
    return interpolateString(value, context, options);
  }
  if (Array.isArray(value)) {
    return value.map((v) => deepInterpolate(v, context, options));
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = k === "type" ? v : deepInterpolate(v, context, options);
    }
    return out;
  }
  return value;
}

const LAYOUT_ITEM_CHILD_ARRAY_KEYS = new Set([
  "children",
  "footer",
  "headerAction",
]);

const DELEGATED_TEMPLATE_ROOTS = new Set(["item-list", "content"]);

function isLayoutBuilderItemArray(value: unknown): value is LayoutBuilderItem[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every(
    (el) =>
      el !== null &&
      typeof el === "object" &&
      typeof (el as Record<string, unknown>).type === "string",
  );
}

function interpolateLayoutItem(
  item: LayoutBuilderItem,
  context: Record<string, unknown>,
  options: LayoutInterpolationConfig | undefined,
): LayoutBuilderItem {
  const raw = item as Record<string, unknown>;
  const t = raw.type;
  if (typeof t === "string" && DELEGATED_TEMPLATE_ROOTS.has(t)) {
    const out: Record<string, unknown> = { ...raw };
    for (const [k, v] of Object.entries(raw)) {
      if (k === "type" || k === "children") continue;
      out[k] = deepInterpolate(v, context, options);
    }
    out.children = raw.children;
    return out as LayoutBuilderItem;
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k === "type") {
      out[k] = v;
      continue;
    }
    if (LAYOUT_ITEM_CHILD_ARRAY_KEYS.has(k) && isLayoutBuilderItemArray(v)) {
      out[k] = (v as LayoutBuilderItem[]).map((ch) =>
        interpolateLayoutItem(ch, context, options),
      );
      continue;
    }
    out[k] = deepInterpolate(v, context, options);
  }
  return out as LayoutBuilderItem;
}

/** Interpolate `{{ }}` in a layout subtree without breaking `item-list` / `content` row templates. */
export function deepInterpolateLayoutItems(
  items: LayoutBuilderItem[],
  context: Record<string, unknown>,
  options?: LayoutInterpolationConfig,
): LayoutBuilderItem[] {
  return items.map((item) => interpolateLayoutItem(item, context, options));
}

export function asObjectRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

/** Suffix layout item `id`s (recursive) so repeated templates stay unique in React. */
export function withUniqueIdsSuffix(
  items: LayoutBuilderItem[],
  suffix: string,
): LayoutBuilderItem[] {
  return items.map((node) => {
    const next = { ...node } as LayoutBuilderItem & {
      id?: string;
      children?: LayoutBuilderItem[];
    };
    if (typeof next.id === "string" && next.id.length > 0) {
      next.id = `${next.id}${suffix}`;
    }
    if (next.children?.length) {
      next.children = withUniqueIdsSuffix(next.children, suffix);
    }
    return next as LayoutBuilderItem;
  });
}
