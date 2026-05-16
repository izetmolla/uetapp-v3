"use client";

import type { FC } from "react";
import type { LayoutBuilderItem } from "../../types/items";
import type { LayoutRendererProps } from "../../types";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

import type {
    CardActionItem,
    CardContentItem,
    CardDescriptionItem,
    CardFooterItem,
    CardHeaderItem,
    CardItem,
    CardTitleItem,
} from "./types";

function cardUsesComposedSlots(children: LayoutBuilderItem[] | undefined): boolean {
    if (!children?.length) {
        return false;
    }
    const topSlots = new Set(["card-header", "card-content", "card-footer"]);
    return children.some((c) => topSlots.has(c.type));
}

const CardRenderer: FC<LayoutRendererProps<CardItem>> = ({ item, renderItems, path }) => {
    const children = item.children ?? [];

    if (cardUsesComposedSlots(children)) {
        return (
            <Card className={cn(item.className)} style={item.style} size={item.size}>
                {renderItems(children, path)}
            </Card>
        );
    }

    const hasHeader =
        item.title ||
        item.description ||
        (item.headerAction && item.headerAction.length > 0);
    const hasFooter = item.footer && item.footer.length > 0;

    return (
        <Card className={cn(item.className)} style={item.style} size={item.size}>
            {hasHeader ? (
                <CardHeader className={cn(item.headerClassName)}>
                    {item.title ? (
                        <CardTitle className={cn(item.titleClassName)}>{item.title}</CardTitle>
                    ) : null}
                    {item.description ? (
                        <CardDescription className={cn(item.descriptionClassName)}>
                            {item.description}
                        </CardDescription>
                    ) : null}
                    {item.headerAction && item.headerAction.length > 0 ? (
                        <CardAction className={cn(item.headerActionClassName)}>
                            {renderItems(item.headerAction, path ? [...path, -2] : undefined)}
                        </CardAction>
                    ) : null}
                </CardHeader>
            ) : null}
            <CardContent
                className={cn(item.contentClassName, !hasHeader ? "pt-6" : undefined)}
            >
                {renderItems(children, path)}
            </CardContent>
            {hasFooter ? (
                <CardFooter className={cn(item.footerClassName)}>
                    {renderItems(item.footer!, path ? [...path, -1] : undefined)}
                </CardFooter>
            ) : null}
        </Card>
    );
};

const CardActionRenderer: FC<LayoutRendererProps<CardActionItem>> = ({
    item,
    renderItems,
    path,
}) => {
    const { children = [] } = item;
    return (
        <CardAction className={cn(item.className)} style={item.style}>
            {renderItems(children, path)}
        </CardAction>
    );
};

const CardContentRenderer: FC<LayoutRendererProps<CardContentItem>> = ({
    item,
    renderItems,
    path,
}) => {
    const { children = [], paddingTopWhenNoHeader } = item;
    return (
        <CardContent
            className={cn(item.className, paddingTopWhenNoHeader && "pt-6")}
            style={item.style}
        >
            {renderItems(children, path)}
        </CardContent>
    );
};

const CardDescriptionRenderer: FC<LayoutRendererProps<CardDescriptionItem>> = ({ item }) => {
    const { text } = item;
    return (
        <CardDescription className={cn(item.className)} style={item.style}>
            {text}
        </CardDescription>
    );
};

const CardTitleRenderer: FC<LayoutRendererProps<CardTitleItem>> = ({ item }) => {
    const { text } = item;
    return (
        <CardTitle className={cn(item.className)} style={item.style}>
            {text}
        </CardTitle>
    );
};


const CardFooterRenderer: FC<LayoutRendererProps<CardFooterItem>> = ({
    item,
    renderItems,
    path,
}) => {
    const { children = [] } = item;
    return (
        <CardFooter className={cn(item.className)} style={item.style}>
            {renderItems(children, path)}
        </CardFooter>
    );
};

const CardHeaderRenderer: FC<LayoutRendererProps<CardHeaderItem>> = ({
    item,
    renderItems,
    path,
}) => {
    const { children = [] } = item;
    return (
        <CardHeader className={cn(item.className)} style={item.style}>
            {renderItems(children, path)}
        </CardHeader>
    );
};

export default CardRenderer;
export { CardActionRenderer, CardContentRenderer, CardDescriptionRenderer, CardTitleRenderer, CardFooterRenderer, CardHeaderRenderer }
export type { CardItem, CardActionItem, CardContentItem, CardDescriptionItem, CardTitleItem, CardFooterItem, CardHeaderItem };
