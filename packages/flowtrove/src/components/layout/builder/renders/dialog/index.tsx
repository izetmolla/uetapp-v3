"use client";

import type { FC } from "react";
import type { LayoutBuilderItem } from "../../types/items";
import type { LayoutRendererProps } from "../../types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog";
import { cn } from "@workspace/ui/lib/utils";

import type {
    DialogContentItem,
    DialogDescriptionItem,
    DialogFooterItem,
    DialogHeaderItem,
    DialogItem,
    DialogTitleItem,
    DialogTriggerItem,
} from "./types";

function dialogUsesComposedSlots(children: LayoutBuilderItem[] | undefined): boolean {
    if (!children?.length) {
        return false;
    }
    const top = new Set(["dialog-trigger", "dialog-content"]);
    return children.some((c) => top.has(c.type));
}

const DialogRenderer: FC<LayoutRendererProps<DialogItem>> = ({ item, renderItems, path }) => {
    const children = item.children ?? [];

    if (dialogUsesComposedSlots(children)) {
        return (
            <div className={cn(item.className)} style={item.style}>
                <Dialog>{renderItems(children, path)}</Dialog>
            </div>
        );
    }

    const triggerItems = item.trigger ?? [];
    const hasHeader = !!(item.title || item.description);
    const hasFooter = item.footer && item.footer.length > 0;

    return (
        <div className={cn(item.className)} style={item.style}>
            <Dialog>
                <DialogTrigger asChild className={item.triggerClassName}>
                    <div className="inline-flex">
                        {triggerItems.length > 0
                            ? renderItems(triggerItems, path ? [...path, 0] : undefined)
                            : null}
                    </div>
                </DialogTrigger>
                <DialogContent
                    className={item.contentClassName}
                    showCloseButton={item.showCloseButton ?? true}
                >
                    {hasHeader ? (
                        <DialogHeader className={item.headerClassName}>
                            {item.title ? (
                                <DialogTitle className={item.titleClassName}>{item.title}</DialogTitle>
                            ) : null}
                            {item.description ? (
                                <DialogDescription className={item.descriptionClassName}>
                                    {item.description}
                                </DialogDescription>
                            ) : item.title ? (
                                <DialogDescription
                                    className={cn("sr-only", item.descriptionClassName)}
                                >
                                    {item.title}
                                </DialogDescription>
                            ) : (
                                <DialogDescription
                                    className={cn("sr-only", item.descriptionClassName)}
                                >
                                    Dialog content
                                </DialogDescription>
                            )}
                        </DialogHeader>
                    ) : null}
                    {!hasHeader ? (
                        <DialogDescription className="sr-only">Dialog</DialogDescription>
                    ) : null}
                    {children.length > 0 &&
                        renderItems(children, path ? [...path, 1] : undefined)}
                    {hasFooter ? (
                        <DialogFooter className={item.footerClassName}>
                            {renderItems(item.footer!, path ? [...path, 2] : undefined)}
                        </DialogFooter>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
};

const DialogTriggerRenderer: FC<LayoutRendererProps<DialogTriggerItem>> = ({
    item,
    renderItems,
    path,
}) => {
    const { children = [] } = item;
    return (
        <DialogTrigger asChild className={cn(item.className)}>
            <div className="inline-flex">{renderItems(children, path)}</div>
        </DialogTrigger>
    );
};

const DialogContentRenderer: FC<LayoutRendererProps<DialogContentItem>> = ({
    item,
    renderItems,
    path,
}) => {
    const { children = [], showCloseButton } = item;
    return (
        <DialogContent
            className={cn(item.className)}
            style={item.style}
            showCloseButton={showCloseButton ?? true}
        >
            {renderItems(children, path)}
        </DialogContent>
    );
};

const DialogHeaderRenderer: FC<LayoutRendererProps<DialogHeaderItem>> = ({
    item,
    renderItems,
    path,
}) => {
    const { children = [] } = item;
    return (
        <DialogHeader className={cn(item.className)} style={item.style}>
            {renderItems(children, path)}
        </DialogHeader>
    );
};

const DialogTitleRenderer: FC<LayoutRendererProps<DialogTitleItem>> = ({ item }) => {
    const { text } = item;
    return (
        <DialogTitle className={cn(item.className)} style={item.style}>
            {text}
        </DialogTitle>
    );
};

const DialogDescriptionRenderer: FC<LayoutRendererProps<DialogDescriptionItem>> = ({
    item,
}) => {
    const { text } = item;
    return (
        <DialogDescription className={cn(item.className)} style={item.style}>
            {text}
        </DialogDescription>
    );
};

const DialogFooterRenderer: FC<LayoutRendererProps<DialogFooterItem>> = ({
    item,
    renderItems,
    path,
}) => {
    const { children = [], showCloseButton } = item;
    return (
        <DialogFooter className={cn(item.className)} showCloseButton={showCloseButton ?? false}>
            {renderItems(children, path)}
        </DialogFooter>
    );
};

export default DialogRenderer;
export {
    DialogTriggerRenderer,
    DialogContentRenderer,
    DialogHeaderRenderer,
    DialogTitleRenderer,
    DialogDescriptionRenderer,
    DialogFooterRenderer,
};
export type {
    DialogItem,
    DialogTriggerItem,
    DialogContentItem,
    DialogHeaderItem,
    DialogTitleItem,
    DialogDescriptionItem,
    DialogFooterItem,
};
