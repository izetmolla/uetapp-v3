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

/**
 * True when the current location matches the nav target exactly or is a nested route under it.
 * e.g. target `/contracts/scandocuments` matches `/contracts/scandocuments/2024/faculty`.
 */
export function isNavItemActive(pathname: string, to: string): boolean {
    const current = normalizeNavPath(pathname);
    const target = normalizeNavPath(to);
    if (!target) return false;
    if (current === target) return true;
    return current.startsWith(`${target}/`);
}

/** True when this item or any descendant matches the current path. */
export function isNavTreeActive(pathname: string, item: NavigationItem): boolean {
    if (isNavItemActive(pathname, item.to)) return true;
    return item.children?.some((child) => isNavTreeActive(pathname, child)) ?? false;
}
