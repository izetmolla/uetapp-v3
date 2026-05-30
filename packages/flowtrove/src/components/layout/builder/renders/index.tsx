"use client";

import { Suspense, type FC, type ReactNode, useMemo } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { useLayoutBuilderContext } from "../LayoutBuilderContext";
import { buildConditionContext, evaluateCondition } from "../lib/utils";
import type { LayoutRendererProps, LayoutBuilderItem, LayoutBuilderChildItem } from "../types";
import { getRenderer, isLazyRenderer } from "./registry";

export type RenderItemsFn = (items: LayoutBuilderChildItem[]) => React.ReactNode;
export type RenderItemsWithPathFn = (
    items: LayoutBuilderChildItem[],
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

type InnerProps = LayoutBuilderItemRendererProps & {
    conditionContext: Record<string, unknown>;
};

function LayoutBuilderItemRendererInner({
    item: rawItem,
    renderItems,
    path,
    conditionContext,
}: InnerProps) {
    const { data } = useLayoutBuilderContext();

    if (rawItem.condition && !evaluateCondition(rawItem.condition, conditionContext)) {
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
}

function LayoutBuilderItemRendererWithForm({
    form,
    ...props
}: LayoutBuilderItemRendererProps & {
    form: UseFormReturn<Record<string, unknown>>;
}) {
    const { data } = useLayoutBuilderContext();
    const watchedValues = useWatch({ control: form.control });

    const conditionContext = useMemo(
        () =>
            buildConditionContext(
                data,
                (watchedValues ?? form.getValues()) as Record<string, unknown>,
            ),
        [data, watchedValues, form],
    );

    return <LayoutBuilderItemRendererInner {...props} conditionContext={conditionContext} />;
}

function LayoutBuilderItemRendererWithoutForm(props: LayoutBuilderItemRendererProps) {
    const { data } = useLayoutBuilderContext();
    const conditionContext = useMemo(() => buildConditionContext(data), [data]);
    return <LayoutBuilderItemRendererInner {...props} conditionContext={conditionContext} />;
}

const LayoutBuilderItemRenderer: FC<LayoutBuilderItemRendererProps> = (props) => {
    const { form } = useLayoutBuilderContext();

    if (form) {
        return <LayoutBuilderItemRendererWithForm {...props} form={form} />;
    }

    return <LayoutBuilderItemRendererWithoutForm {...props} />;
};

export function renderChildren(
    renderItems: RenderItemsFn | RenderItemsWithPathFn,
    children: LayoutBuilderChildItem[],
    path: number[] | undefined
): React.ReactNode {
    const list = Array.isArray(children) ? children : [];
    if (path !== undefined) {
        return (renderItems as RenderItemsWithPathFn)(list, path);
    }
    return (renderItems as RenderItemsFn)(list);
}

export default LayoutBuilderItemRenderer;
