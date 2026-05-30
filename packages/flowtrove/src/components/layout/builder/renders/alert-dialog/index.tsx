"use client";

import type { FC } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { cn } from "@workspace/ui/lib/utils";
import type { LayoutRendererProps } from "../../types";
import { childrenUseComposedSlots } from "../../lib/compound-detect";
import type {
    AlertDialogContentItem,
    AlertDialogDescriptionItem,
    AlertDialogFooterItem,
    AlertDialogHeaderItem,
    AlertDialogItem,
    AlertDialogTitleItem,
    AlertDialogTriggerItem,
} from "./types";

const SLOTS = ["alert-dialog-trigger", "alert-dialog-content"] as const;

const AlertDialogRenderer: FC<LayoutRendererProps<AlertDialogItem>> = ({
    item,
    renderItems,
    path,
}) => {
    const children = item.children ?? [];

    if (childrenUseComposedSlots(children, SLOTS)) {
        return (
            <div className={cn(item.className)} style={item.style}>
                <AlertDialog>{renderItems(children, path)}</AlertDialog>
            </div>
        );
    }

    const triggerItems = item.trigger ?? [];
    const hasHeader = !!(item.title || item.description);
    const hasFooter = item.footer && item.footer.length > 0;

    return (
        <div className={cn(item.className)} style={item.style}>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <div className="inline-flex">
                        {triggerItems.length > 0
                            ? renderItems(triggerItems, path ? [...path, 0] : undefined)
                            : null}
                    </div>
                </AlertDialogTrigger>
                <AlertDialogContent size={item.size}>
                    {hasHeader ? (
                        <AlertDialogHeader>
                            {item.title ? <AlertDialogTitle>{item.title}</AlertDialogTitle> : null}
                            {item.description ? (
                                <AlertDialogDescription>{item.description}</AlertDialogDescription>
                            ) : null}
                        </AlertDialogHeader>
                    ) : null}
                    {children.length > 0 &&
                        renderItems(children, path ? [...path, 1] : undefined)}
                    {hasFooter ? (
                        <AlertDialogFooter>
                            {renderItems(item.footer!, path ? [...path, 2] : undefined)}
                        </AlertDialogFooter>
                    ) : null}
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

const AlertDialogTriggerRenderer: FC<LayoutRendererProps<AlertDialogTriggerItem>> = ({
    item,
    renderItems,
    path,
}) => (
    <AlertDialogTrigger asChild className={cn(item.className)}>
        <div className="inline-flex">{renderItems(item.children ?? [], path)}</div>
    </AlertDialogTrigger>
);

const AlertDialogContentRenderer: FC<LayoutRendererProps<AlertDialogContentItem>> = ({
    item,
    renderItems,
    path,
}) => (
    <AlertDialogContent size={item.size} className={cn(item.className)} style={item.style}>
        {renderItems(item.children ?? [], path)}
    </AlertDialogContent>
);

const AlertDialogHeaderRenderer: FC<LayoutRendererProps<AlertDialogHeaderItem>> = ({
    item,
    renderItems,
    path,
}) => (
    <AlertDialogHeader className={cn(item.className)} style={item.style}>
        {renderItems(item.children ?? [], path)}
    </AlertDialogHeader>
);

const AlertDialogTitleRenderer: FC<LayoutRendererProps<AlertDialogTitleItem>> = ({ item }) => (
    <AlertDialogTitle className={cn(item.className)} style={item.style}>
        {item.text}
    </AlertDialogTitle>
);

const AlertDialogDescriptionRenderer: FC<LayoutRendererProps<AlertDialogDescriptionItem>> = ({
    item,
}) => (
    <AlertDialogDescription className={cn(item.className)} style={item.style}>
        {item.text}
    </AlertDialogDescription>
);

const AlertDialogFooterRenderer: FC<LayoutRendererProps<AlertDialogFooterItem>> = ({
    item,
    renderItems,
    path,
}) => (
    <AlertDialogFooter className={cn(item.className)} style={item.style}>
        {renderItems(item.children ?? [], path)}
    </AlertDialogFooter>
);

export default AlertDialogRenderer;
export {
    AlertDialogTriggerRenderer,
    AlertDialogContentRenderer,
    AlertDialogHeaderRenderer,
    AlertDialogTitleRenderer,
    AlertDialogDescriptionRenderer,
    AlertDialogFooterRenderer,
};
export type {
    AlertDialogItem,
    AlertDialogTriggerItem,
    AlertDialogContentItem,
    AlertDialogHeaderItem,
    AlertDialogTitleItem,
    AlertDialogDescriptionItem,
    AlertDialogFooterItem,
};
