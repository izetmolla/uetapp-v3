import { type LayoutBuilderItem } from "../types/items";

export function hasChildren(item: LayoutBuilderItem): item is LayoutBuilderItem & { children: LayoutBuilderItem[] } {
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

/** Evaluate a simple condition expression against data */
export function evaluateCondition(condition: string, data: Record<string, unknown>): boolean {
    // Simple condition parser for expressions like "data.showSection === true"
    // For security, we use a whitelist approach instead of eval

    const trimmed = condition.trim();

    // Handle simple boolean paths like "data.isVisible"
    if (/^[\w.]+$/.test(trimmed)) {
        return Boolean(getDataValue(data, trimmed.replace(/^data\./, "")));
    }

    // Handle equality checks: "data.status === 'active'"
    const eqMatch = trimmed.match(/^([\w.]+)\s*(===|==|!==|!=)\s*(.+)$/);
    if (eqMatch) {
        const [, path, operator, rawValue] = eqMatch;
        const dataPath = path.replace(/^data\./, "");
        const actualValue = getDataValue(data, dataPath);

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
        const dataPath = path.replace(/^data\./, "");
        const actualValue = Number(getDataValue(data, dataPath));
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




