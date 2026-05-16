import { memo } from "react";
import type { CSSProperties } from "react";
import { NodeResizer, type NodeProps } from "reactflow";
import { cn } from "@workspace/ui/lib/utils";

export type GroupNodeData = {
    label: string;
};

type GroupFrameProps = NodeProps<GroupNodeData> & {
    style?: CSSProperties;
    width?: number;
    height?: number;
};

/** Resizable group frame (sub-flow container). See https://reactflow.dev/examples/nodes/node-resizer */
export const GroupFrameNode = memo(function GroupFrameNode({
    data,
    selected,
    style,
    width,
    height,
}: GroupFrameProps) {
    const mergedStyle: CSSProperties = {
        ...style,
        ...(typeof width === "number" ? { width } : {}),
        ...(typeof height === "number" ? { height } : {}),
    };
    return (
        <>
            <NodeResizer
                minWidth={140}
                minHeight={100}
                isVisible={selected}
                lineClassName="!border-primary/50"
                handleClassName={cn(
                    "!h-2.5 !w-2.5 !min-h-2.5 !min-w-2.5 !rounded-sm !border-2 !border-background !bg-primary shadow-sm",
                )}
            />
            <div
                className={cn(
                    "relative box-border h-full min-h-[100px] w-full min-w-[140px] overflow-visible rounded-lg px-2 py-1.5",
                )}
                style={mergedStyle}
            >
                <div className="pointer-events-none text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {data.label}
                </div>
            </div>
        </>
    );
});
