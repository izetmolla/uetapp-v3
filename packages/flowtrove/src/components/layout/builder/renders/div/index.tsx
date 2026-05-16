import type { FC } from "react"
import type { LayoutRendererProps } from "../../types";
import type { DivItem } from "./types";
import { cn } from "@workspace/ui/lib/utils";





const DivRenderer: FC<LayoutRendererProps<DivItem>> = ({
    item,
    renderItems,
    path,
}) => {
    const {
        children: _children,
        type: _type,
        id: _id,
        condition: _condition,
        locked: _locked,
        styleType: _styleType,
        props: nestedProps,
        className,
        style,
        children = [],
        ...divProps
    } = item as typeof item & { styleType?: string; props?: Record<string, unknown> };

    // `path` is only provided by the designer — use it to apply editor-only
    // visual chrome via Tailwind classes that are never present in production.
    const isDesignerMode = path !== undefined

    return (
        <div
            {...(nestedProps ?? {})}
            {...divProps}
            className={cn(
                className,
                isDesignerMode && "outline outline-1 outline-dashed outline-border/80 min-h-10",
            )}
            style={style}
        >
            {renderItems(children, path)}
        </div>
    );
};

export default DivRenderer;
export type { DivItem };