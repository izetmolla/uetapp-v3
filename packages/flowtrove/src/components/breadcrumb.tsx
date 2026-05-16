import {
    Breadcrumb,
    BreadcrumbItem as BreadcrumbItemUI,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { cn } from "@workspace/ui/lib/utils"
import type { ComponentProps, ReactNode } from "react"
import { Link, useParams } from "react-router"

export type BreadcrumbSegment = {
    id?: string
    label: ReactNode
    /**
     * One path piece appended after the prefix and any earlier segments (slashes trimmed).
     * Omit on the last crumb when it is the current page (no link).
     */
    segment?: string | null
    /**
     * Full href when you cannot build from segments (external URL, special route).
     * For app paths starting with `/`, later items extend from this path.
     */
    href?: string | null
}

export type BreadcrumbsProps = {
    items: BreadcrumbSegment[]
    listClassName?: string
    withWs?: boolean
    /**
     * Prefix for segment-based hrefs, no trailing slash.
     * If omitted and `withWs` is set, defaults to `/workspace/:ws/endpoints`, otherwise an empty prefix.
     */
    basePath?: string
} & Omit<ComponentProps<typeof Breadcrumb>, "children">

function stripTrailingSlashes(p: string): string {
    return p.trim().replace(/\/+$/, "")
}

function workspaceEndpointsBase(ws: string): string {
    return `/workspace/${ws}`
}

function computePrefixPath(
    basePath: string | undefined,
    withWs: boolean,
    ws: string
): string {
    if (basePath !== undefined) {
        return stripTrailingSlashes(basePath)
    }
    if (withWs && ws !== "") {
        return workspaceEndpointsBase(ws)
    }
    return ""
}

function appendSegment(base: string, segment: string): string {
    const s = segment.replace(/^\/+|\/+$/g, "")
    if (!s) return base || "/"
    if (!base) return `/${s}`
    return `${base.replace(/\/+$/, "")}/${s}`
}

function afterAppHref(href: string): string {
    return stripTrailingSlashes(href) || "/"
}

function resolveItemHrefs(
    items: BreadcrumbSegment[],
    prefixPath: string
): Array<{ id?: string; label: ReactNode; href: string | null }> {
    let cursor = prefixPath
    return items.map((item) => {
        if (item.href != null && item.href !== "") {
            const h = item.href
            if (h.startsWith("/")) {
                cursor = afterAppHref(h)
            }
            return { id: item.id, label: item.label, href: h }
        }
        if (item.segment != null && item.segment !== "") {
            cursor = appendSegment(cursor, item.segment)
            return { id: item.id, label: item.label, href: cursor }
        }
        return { id: item.id, label: item.label, href: null }
    })
}

export function Breadcrumbs({
    items,
    className,
    listClassName,
    withWs = false,
    basePath,
    ...navProps
}: BreadcrumbsProps) {
    const { ws = "" } = useParams()
    const prefixPath = computePrefixPath(basePath, withWs, ws)

    const head: Array<{ id?: string; label: ReactNode; href: string | null }> =
        withWs && ws !== ""
            ? [{ label: "Home", href: workspaceEndpointsBase(ws) }]
            : [{ label: "Home", href: "/" }]

    const tail = resolveItemHrefs(items, prefixPath)
    const segments = [...head, ...tail]

    return (
        <Breadcrumb className={cn(className)} {...navProps}>
            <BreadcrumbList className={listClassName}>
                {segments.map((seg, i) => (
                    <span key={seg.id ?? i} className="contents">
                        {i > 0 ? <BreadcrumbSeparator /> : null}
                        <BreadcrumbItemUI>
                            {seg.href != null && seg.href !== "" ? (
                                <BreadcrumbLink asChild>
                                    <Link to={seg.href}>{seg.label}</Link>
                                </BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage>{seg.label}</BreadcrumbPage>
                            )}
                        </BreadcrumbItemUI>
                    </span>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

export default Breadcrumbs
