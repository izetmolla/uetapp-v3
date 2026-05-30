"use client";

import type { FC } from "react";
import type { LayoutRendererProps } from "../../types";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@workspace/ui/components/sheet";
import { cn } from "@workspace/ui/lib/utils";
import { childrenUseComposedSlots } from "../../lib/compound-detect";
import type {
    SheetContentItem,
    SheetDescriptionItem,
    SheetFooterItem,
    SheetHeaderItem,
    SheetItem,
    SheetTitleItem,
    SheetTriggerItem,
} from "./types";

const SHEET_SLOTS = ["sheet-trigger", "sheet-content"] as const;

const SheetRenderer: FC<LayoutRendererProps<SheetItem>> = ({ item, renderItems, path }) => {
    const children = item.children ?? [];

    if (childrenUseComposedSlots(children, SHEET_SLOTS)) {
        return (
            <div className={cn(item.className)} style={item.style}>
                <Sheet>{renderItems(children, path)}</Sheet>
            </div>
        );
    }

    const triggerItems = item.trigger ?? [];
    const hasHeader = !!(item.title || item.description);
    const hasFooter = item.footer && item.footer.length > 0;

    return (
        <div className={cn(item.className)} style={item.style}>
            <Sheet>
                <SheetTrigger asChild className={item.triggerClassName}>
                    <div className="inline-flex">
                        {triggerItems.length > 0
                            ? renderItems(triggerItems, path ? [...path, 0] : undefined)
                            : null}
                    </div>
                </SheetTrigger>
                <SheetContent
                    side={item.side ?? "right"}
                    className={item.contentClassName}
                    showCloseButton={item.showCloseButton ?? true}
                >
                    {hasHeader ? (
                        <SheetHeader className={item.headerClassName}>
                            {item.title ? (
                                <SheetTitle className={item.titleClassName}>{item.title}</SheetTitle>
                            ) : null}
                            {item.description ? (
                                <SheetDescription className={item.descriptionClassName}>
                                    {item.description}
                                </SheetDescription>
                            ) : null}
                        </SheetHeader>
                    ) : null}
                    {children.length > 0 &&
                        renderItems(children, path ? [...path, 1] : undefined)}
                    {hasFooter ? (
                        <SheetFooter className={item.footerClassName}>
                            {renderItems(item.footer!, path ? [...path, 2] : undefined)}
                        </SheetFooter>
                    ) : null}
                </SheetContent>
            </Sheet>
        </div>
    );
};

const SheetTriggerRenderer: FC<LayoutRendererProps<SheetTriggerItem>> = ({
    item,
    renderItems,
    path,
}) => (
    <SheetTrigger asChild className={cn(item.className)}>
        <div className="inline-flex">{renderItems(item.children ?? [], path)}</div>
    </SheetTrigger>
);

const SheetContentRenderer: FC<LayoutRendererProps<SheetContentItem>> = ({
    item,
    renderItems,
    path,
}) => (
    <SheetContent
        side={item.side ?? "right"}
        className={cn(item.className)}
        style={item.style}
        showCloseButton={item.showCloseButton ?? true}
    >
        {renderItems(item.children ?? [], path)}
    </SheetContent>
);

const SheetHeaderRenderer: FC<LayoutRendererProps<SheetHeaderItem>> = ({
    item,
    renderItems,
    path,
}) => (
    <SheetHeader className={cn(item.className)} style={item.style}>
        {renderItems(item.children ?? [], path)}
    </SheetHeader>
);

const SheetTitleRenderer: FC<LayoutRendererProps<SheetTitleItem>> = ({ item }) => (
    <SheetTitle className={cn(item.className)} style={item.style}>
        {item.text}
    </SheetTitle>
);

const SheetDescriptionRenderer: FC<LayoutRendererProps<SheetDescriptionItem>> = ({ item }) => (
    <SheetDescription className={cn(item.className)} style={item.style}>
        {item.text}
    </SheetDescription>
);

const SheetFooterRenderer: FC<LayoutRendererProps<SheetFooterItem>> = ({
    item,
    renderItems,
    path,
}) => (
    <SheetFooter className={cn(item.className)} style={item.style}>
        {renderItems(item.children ?? [], path)}
    </SheetFooter>
);

export default SheetRenderer;
export {
    SheetTriggerRenderer,
    SheetContentRenderer,
    SheetHeaderRenderer,
    SheetTitleRenderer,
    SheetDescriptionRenderer,
    SheetFooterRenderer,
};
export type {
    SheetItem,
    SheetTriggerItem,
    SheetContentItem,
    SheetHeaderItem,
    SheetTitleItem,
    SheetDescriptionItem,
    SheetFooterItem,
};
