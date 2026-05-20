"use client";

import { type FC, useMemo } from "react";

import { ContentLoaderBreadcrumb } from "./breadcrumb";
import type { BreadcrumbItem, ContentLoaderHeaderProps } from "./types";
import { cn } from "@workspace/ui/lib/utils";

const HOME_ITEM: BreadcrumbItem = { label: "Home", to: "/" };

/**
 * Prepends "Home" as the first breadcrumb item if the list is non-empty and does not already start with Home.
 * Does not mutate the incoming array.
 */
function breadcrumbWithHome(
    breadcrumb: BreadcrumbItem[] | undefined
): BreadcrumbItem[] {
    if (!breadcrumb?.length) return breadcrumb ?? [];
    const first = breadcrumb[0];
    if (first?.label === "Home" && (first?.to === "/" || first?.to === undefined))
        return breadcrumb;
    return [HOME_ITEM, ...breadcrumb];
}

/**
 * Builds the breadcrumb array with the current page title appended if missing.
 * Does not mutate the incoming array.
 */
function breadcrumbWithTitle(
    breadcrumb: BreadcrumbItem[] | undefined,
    title: string | undefined
): BreadcrumbItem[] {
    if (!title || !breadcrumb?.length) return breadcrumb ?? [];
    const hasTitle = breadcrumb.some((item) => item.label === title);
    if (hasTitle) return breadcrumb;
    return [...breadcrumb, { label: title }];
}

/**
 * Page header with optional title, description, breadcrumb trail, and right-side actions.
 * Used by ContentLoader for consistent layout above loading, error, or content.
 */
export const ContentLoaderHeader: FC<ContentLoaderHeaderProps> = ({
    title,
    description,
    breadcrumb,
    rightComponent,
    customTitle,
    error,
    forMeta,
    showHeaderSeparator = false,
    headerSeparatorMarginY = "mb-6",
    headerClassName,
}) => {
    const breadcrumbWithCurrent = useMemo(() => {
        const withHome = breadcrumbWithHome(breadcrumb);
        return breadcrumbWithTitle(withHome, title);
    }, [breadcrumb, title]);

    if (forMeta) return null;

    const showHeader = Boolean(
        title ?? description ?? rightComponent ?? breadcrumbWithCurrent.length > 0
    );
    if (!showHeader) return null;

    return (
        <div
            className={cn(
                "flex flex-wrap items-center justify-between space-y-2",
                showHeaderSeparator
                    ? cn("border-b border-border pb-1", headerSeparatorMarginY)
                    : "mb-2",
                headerClassName,
            )}
        >
            <div className="space-y-1">
                {customTitle && !error
                    ? customTitle
                    : title
                        ? <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                        : null}
                {description && (
                    <p className="text-muted-foreground text-sm">{description}</p>
                )}
                {breadcrumbWithCurrent.length > 0 && (
                    <ContentLoaderBreadcrumb breadcrumb={breadcrumbWithCurrent} />
                )}
            </div>
            {rightComponent && (
                <div className="flex min-w-0 w-full flex-1 basis-full justify-end sm:w-auto sm:max-w-2xl">
                    {rightComponent}
                </div>
            )}
        </div>
    );
};