import { lazy, Suspense, type FC, type ReactNode } from "react";
import { useLayoutBuilderContext } from "../LayoutBuilderContext";
import { evaluateCondition } from "../lib/utils";
import type { LayoutRendererProps, LayoutBuilderItem } from "../types";
import * as CardRenderers from "./card";
import * as DialogRenderers from "./dialog";



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


//Lazy import the renderers
// const ChartRenderer = lazy(() => import("./chart").then(module => ({ default: module.ChartRenderer })));
// const DatePickerRenderer = lazy(() => import("./date-picker").then(module => ({ default: module.DatePickerRenderer })));
// const QrBarcodeScannerRenderer = lazy(() => import("./qr-barcode-scanner").then(module => ({ default: module.QrBarcodeScannerRenderer })));

const DivRendererLazy = lazy(() => import("./div"));
const ButtonRendererLazy = lazy(() => import("./button"));

/** One boundary for every `lazy()` renderer; sync cases pass through unchanged. */
function LazyRendererBoundary({ children }: { children: ReactNode }) {
    return <Suspense fallback={null}>{children}</Suspense>;
}

const LayoutBuilderItemRenderer: FC<LayoutBuilderItemRendererProps> = ({
    item: rawItem,
    renderItems,
    path,
}) => {

    const { data } = useLayoutBuilderContext();

    // Check conditional rendering
    if (rawItem.condition && data && !evaluateCondition(rawItem.condition, data)) {
        return null;
    }

    // Designer-only metadata must never be forwarded to native DOM via renderer spreads.
    const { locked: _locked, styleType: _legacyStyleType, ...safeItem } = rawItem as LayoutBuilderItem & {
        locked?: boolean
        styleType?: string
    };
    const item = safeItem as LayoutBuilderItem;

    const props: LayoutRendererProps = {
        item,
        renderItems: renderItems as RenderItemsWithPathFn,
        path,
        data,
    };

    function renderForType(): ReactNode {
        switch (item.type) {
            case "div":
                return <DivRendererLazy {...props} item={item} />;
            case "button":
                return <ButtonRendererLazy {...props} item={item} />;
            case "card":
                return <CardRenderers.default {...props} item={item} />;
            case "card-header":
                return <CardRenderers.CardHeaderRenderer {...props} item={item} />;
            case "card-title":
                return <CardRenderers.CardTitleRenderer {...props} item={item} />;
            case "card-description":
                return <CardRenderers.CardDescriptionRenderer {...props} item={item} />;
            case "card-action":
                return <CardRenderers.CardActionRenderer {...props} item={item} />;
            case "card-content":
                return <CardRenderers.CardContentRenderer {...props} item={item} />;
            case "card-footer":
                return <CardRenderers.CardFooterRenderer {...props} item={item} />;
            case "dialog":
                return <DialogRenderers.default {...props} item={item} />;
            case "dialog-trigger":
                return <DialogRenderers.DialogTriggerRenderer {...props} item={item} />;
            case "dialog-content":
                return <DialogRenderers.DialogContentRenderer {...props} item={item} />;
            case "dialog-header":
                return <DialogRenderers.DialogHeaderRenderer {...props} item={item} />;
            case "dialog-title":
                return <DialogRenderers.DialogTitleRenderer {...props} item={item} />;
            case "dialog-description":
                return <DialogRenderers.DialogDescriptionRenderer {...props} item={item} />;
            case "dialog-footer":
                return <DialogRenderers.DialogFooterRenderer {...props} item={item} />;

            // TODO: Add more renderers for remaining component types
            // For now, check custom components, then render a placeholder
            default: {
                // const { customComponents } = useLayoutBuilderContext();
                // const customDef = customComponents?.find(
                //     (c) => c.type === (item as LayoutBuilderItem).type
                // );
                // if (customDef) {
                //     const CustomComp = customDef.component;
                //     return (
                //         <CustomComp
                //             item={item as LayoutBuilderItem}
                //             renderItems={renderItems as RenderItemsWithPathFn}
                //             path={path}
                //             data={data}
                //         />
                //     );
                // }
                return (
                    <div className="rounded-md border border-dashed border-amber-500/50 bg-amber-50 p-4 text-sm text-amber-700">
                        Component type "{(item as LayoutBuilderItem).type}" not implemented yet
                    </div>
                );
            }
        }
    }

    return <LazyRendererBoundary>{renderForType()}</LazyRendererBoundary>;
}


/** Render children items helper */
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