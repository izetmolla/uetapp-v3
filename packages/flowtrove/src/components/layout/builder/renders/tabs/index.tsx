"use client";

import type { FC } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";
import type { LayoutRendererProps } from "../../types";
import { childrenUseComposedSlots } from "../../lib/compound-detect";
import type { TabsContentItem, TabsItem, TabsListItem, TabsTriggerItem } from "./types";

const TAB_SLOTS = ["tabs-list", "tabs-trigger", "tabs-content"] as const;

const TabsRenderer: FC<LayoutRendererProps<TabsItem>> = ({ item, renderItems, path }) => {
    const children = item.children ?? [];

    if (childrenUseComposedSlots(children, TAB_SLOTS)) {
        return (
            <Tabs
                defaultValue={item.defaultValue}
                orientation={item.orientation}
                className={cn(item.className)}
                style={item.style}
            >
                {renderItems(children, path)}
            </Tabs>
        );
    }

    const tabs = item.tabs ?? [];
    const defaultValue = item.defaultValue ?? tabs[0]?.value;

    return (
        <Tabs
            defaultValue={defaultValue}
            orientation={item.orientation}
            className={cn(item.className)}
            style={item.style}
        >
            <TabsList variant={item.listVariant}>
                {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
            {tabs.map((tab, index) => (
                <TabsContent key={tab.value} value={tab.value}>
                    {renderItems(tab.children ?? [], path ? [...path, index] : undefined)}
                </TabsContent>
            ))}
        </Tabs>
    );
};

const TabsListRenderer: FC<LayoutRendererProps<TabsListItem>> = ({
    item,
    renderItems,
    path,
}) => (
    <TabsList variant={item.variant} className={cn(item.className)} style={item.style}>
        {renderItems(item.children ?? [], path)}
    </TabsList>
);

const TabsTriggerRenderer: FC<LayoutRendererProps<TabsTriggerItem>> = ({ item }) => (
    <TabsTrigger value={item.value} className={cn(item.className)} style={item.style}>
        {item.text}
    </TabsTrigger>
);

const TabsContentRenderer: FC<LayoutRendererProps<TabsContentItem>> = ({
    item,
    renderItems,
    path,
}) => (
    <TabsContent value={item.value} className={cn(item.className)} style={item.style}>
        {renderItems(item.children ?? [], path)}
    </TabsContent>
);

export default TabsRenderer;
export { TabsListRenderer, TabsTriggerRenderer, TabsContentRenderer };
export type { TabsItem, TabsListItem, TabsTriggerItem, TabsContentItem, TabDef } from "./types";
