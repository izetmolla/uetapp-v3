import { type LayoutBuilderItem } from "../types/items";
import type { LayoutBuilderChildItem } from "../types/base-layout";

export function hasChildren(
    item: LayoutBuilderChildItem,
): item is LayoutBuilderChildItem & { children: LayoutBuilderChildItem[] } {
    return "children" in item && Array.isArray(item.children);
}




export function keyForItem(item: LayoutBuilderItem, index: number): string {
    if (item.id) return item.id;
    if (hasChildren(item)) return `${item.type}_${index}`;
    return `${(item as LayoutBuilderItem)?.type}_${index}`;
}



export function getDataValue(data: Record<string, unknown>, path: string): unknown {
    const keys = path.split(".");
    let current: unknown = data;

    for (const key of keys) {
        if (current === null || current === undefined) {
            return undefined;
        }
        if (typeof current !== "object") {
            return undefined;
        }
        current = (current as Record<string, unknown>)[key];
    }

    return current;
}

/**
 * Build evaluation context for `condition` expressions.
 * Supports layout `data`, live form values, and explicit namespaces:
 * - `data.profile.title` — layout runtime data
 * - `form.newsletter` / `values.newsletter` — current form field values
 * - `newsletter === true` — form field first, then layout data
 */
export function buildConditionContext(
    layoutData?: Record<string, unknown>,
    formValues?: Record<string, unknown>,
): Record<string, unknown> {
    return {
        data: layoutData ?? {},
        form: formValues ?? {},
        values: formValues ?? {},
    };
}

/** Resolve a condition path against layout data and/or form values. */
export function getConditionValue(context: Record<string, unknown>, path: string): unknown {
    const trimmed = path.trim();
    const layoutData = (context.data ?? {}) as Record<string, unknown>;
    const formValues = (context.form ?? context.values ?? {}) as Record<string, unknown>;

    if (trimmed.startsWith("data.")) {
        return getDataValue(layoutData, trimmed.slice(5));
    }
    if (trimmed.startsWith("form.") || trimmed.startsWith("values.")) {
        return getDataValue(formValues, trimmed.replace(/^(form|values)\./, ""));
    }

    const formValue = getDataValue(formValues, trimmed);
    if (formValue !== undefined) {
        return formValue;
    }
    return getDataValue(layoutData, trimmed);
}

/** Evaluate a simple condition expression against layout data and form values */
export function evaluateCondition(
    condition: string,
    context: Record<string, unknown>,
): boolean {
    const trimmed = condition.trim();

    // Handle simple boolean paths like "data.isVisible" or "newsletter"
    if (/^[\w.]+$/.test(trimmed)) {
        return Boolean(getConditionValue(context, trimmed));
    }

    // Handle equality checks: "form.accountType === 'business'"
    const eqMatch = trimmed.match(/^([\w.]+)\s*(===|==|!==|!=)\s*(.+)$/);
    if (eqMatch) {
        const [, path, operator, rawValue] = eqMatch;
        const actualValue = getConditionValue(context, path);

        // Parse the comparison value
        let compareValue: unknown;
        if (rawValue === "true") {
            compareValue = true;
        } else if (rawValue === "false") {
            compareValue = false;
        } else if (rawValue === "null") {
            compareValue = null;
        } else if (rawValue === "undefined") {
            compareValue = undefined;
        } else if (/^['"].*['"]$/.test(rawValue)) {
            compareValue = rawValue.slice(1, -1);
        } else if (!isNaN(Number(rawValue))) {
            compareValue = Number(rawValue);
        } else {
            compareValue = rawValue;
        }

        switch (operator) {
            case "===":
            case "==":
                return actualValue === compareValue;
            case "!==":
            case "!=":
                return actualValue !== compareValue;
        }
    }

    // Handle comparison operators: "data.count > 5"
    const compMatch = trimmed.match(/^([\w.]+)\s*(>=|<=|>|<)\s*(.+)$/);
    if (compMatch) {
        const [, path, operator, rawValue] = compMatch;
        const actualValue = Number(getConditionValue(context, path));
        const compareValue = Number(rawValue);

        switch (operator) {
            case ">":
                return actualValue > compareValue;
            case "<":
                return actualValue < compareValue;
            case ">=":
                return actualValue >= compareValue;
            case "<=":
                return actualValue <= compareValue;
        }
    }

    // Default: if we can't parse the condition, return true
    console.warn(`Unable to parse condition: ${condition}`);
    return true;
}




