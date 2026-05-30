import { Suspense, type FC, type ReactNode } from "react";
import { useLayoutBuilderContext } from "../LayoutBuilderContext";
import { evaluateCondition } from "../lib/utils";
import type { LayoutRendererProps, LayoutBuilderItem } from "../types";
import { getRenderer, isLazyRenderer } from "./registry";

export type RenderItemsFn = (items: LayoutBuilderItem[]) => React.ReactNode;
export type RenderItemsWithPathFn = (
    items: LayoutBuilderItem[],
    pathPrefix?: number[]
) => React.ReactNode;

export type LayoutBuilderItemRendererProps = {
    item: LayoutBuilderItem;
    renderItems: RenderItemsFn | RenderItemsWithPathFn;
    path?: number[];
};

function LazyRendererBoundary({ children }: { children: ReactNode }) {
    return <Suspense fallback={null}>{children}</Suspense>;
}

const LayoutBuilderItemRenderer: FC<LayoutBuilderItemRendererProps> = ({
    item: rawItem,
    renderItems,
    path,
}) => {
    const { data } = useLayoutBuilderContext();

    if (rawItem.condition && data && !evaluateCondition(rawItem.condition, data)) {
        return null;
    }

    const { locked: _locked, styleType: _legacyStyleType, ...safeItem } = rawItem as LayoutBuilderItem & {
        locked?: boolean;
        styleType?: string;
    };
    const item = safeItem as LayoutBuilderItem;

    const props: LayoutRendererProps = {
        item,
        renderItems: renderItems as RenderItemsWithPathFn,
        path,
        data,
    };

    const Renderer = getRenderer(item.type);

    if (!Renderer) {
        return (
            <div className="rounded-md border border-dashed border-amber-500/50 bg-amber-50 p-4 text-sm text-amber-700">
                Component type "{item.type}" not implemented yet
            </div>
        );
    }

    const node = <Renderer {...props} item={item} />;

    if (isLazyRenderer(item.type)) {
        return <LazyRendererBoundary>{node}</LazyRendererBoundary>;
    }

    return node;
};

export function renderChildren(
    renderItems: RenderItemsFn | RenderItemsWithPathFn,
    children: LayoutBuilderItem[],
    path: number[] | undefined
): React.ReactNode {
    const list = Array.isArray(children) ? children : [];
    if (path !== undefined) {
        return (renderItems as RenderItemsWithPathFn)(list, path);
    }
    return (renderItems as RenderItemsFn)(list);
}

export default LayoutBuilderItemRenderer;
