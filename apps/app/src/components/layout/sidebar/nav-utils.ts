export type NavigationItem = {
    title: string;
    to: string;
    icon?: string;
    isExternal?: boolean;
    isComing?: boolean;
    isDataBadge?: string;
    isNew?: boolean;
    newTab?: boolean;
    prefetch?: "none" | "render" | "intent";
    roles?: string[];
    children?: NavigationItem[];
};

/** Normalize paths for comparison (no trailing slash, ignore hash-only links). */
export function normalizeNavPath(path: string | undefined): string {
    if (!path || path === "#") return "";
    const trimmed = path.replace(/\/+$/, "");
    return trimmed || "/";
}

/** Collect all nav targets in a sidebar group (including nested items). */
export function collectNavPaths(items: NavigationItem[] | undefined): string[] {
    if (!items?.length) return [];
    const paths: string[] = [];
    for (const item of items) {
        const to = normalizeNavPath(item.to);
        if (to) paths.push(to);
        paths.push(...collectNavPaths(item.children));
    }
    return paths;
}

/**
 * True when the current location matches the nav target exactly or is a nested route under it.
 * e.g. target `/contracts/scandocuments` matches `/contracts/scandocuments/2024/faculty`.
 *
 * When `groupPaths` is provided, a prefix match is suppressed if another nav item in the same
 * group is a longer path that also matches (e.g. `/contracts` is not active on `/contracts/scandocuments`).
 */
export function isNavItemActive(
    pathname: string,
    to: string,
    groupPaths?: string[],
): boolean {
    const current = normalizeNavPath(pathname);
    const target = normalizeNavPath(to);
    if (!target) return false;
    if (current === target) return true;
    if (!current.startsWith(`${target}/`)) return false;

    if (groupPaths?.length) {
        for (const otherTo of groupPaths) {
            const other = normalizeNavPath(otherTo);
            if (!other || other === target || !other.startsWith(`${target}/`)) continue;
            if (current === other || current.startsWith(`${other}/`)) return false;
        }
    }

    return true;
}

/** True when this item or any descendant matches the current path. */
export function isNavTreeActive(
    pathname: string,
    item: NavigationItem,
    groupPaths?: string[],
): boolean {
    if (isNavItemActive(pathname, item.to, groupPaths)) return true;
    return item.children?.some((child) => isNavTreeActive(pathname, child, groupPaths)) ?? false;
}
