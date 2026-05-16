import { Handle, Position, type NodeProps } from "reactflow";
import { NODE_META, type NodeKind } from "../../../../../../types";
import { useBackendStore } from "../../../../../../store/backendStore";
import type { ReactNode } from "react";
import { cn } from "@workspace/ui/lib/utils";

interface BaseData {
    kind: NodeKind;
    label: string;
    summary?: string;
}

export function BaseNode({
    id, data, selected, hasInput = true, hasOutput = true, children, extraHandles,
}: NodeProps<BaseData> & {
    hasInput?: boolean;
    hasOutput?: boolean;
    children?: ReactNode;
    extraHandles?: ReactNode;
}) {
    const meta = NODE_META[data.kind];
    const Icon = meta.icon;
    const selectedNodeId = useBackendStore((s) => s.ui.selectedNodeId);
    const configPanelOpen = selectedNodeId === id;

    return (
        <div
            className={cn(
                "relative min-w-[188px] max-w-[280px] rounded-lg border-2 border-border/90 bg-card text-card-foreground shadow-md",
                "dark:border-border",
                "backdrop-blur-[2px] transition-[box-shadow,border-color,ring-width]",
                (configPanelOpen || selected) && "border-primary shadow-lg ring-2 ring-primary/30",
            )}
            style={{
                boxShadow: `0 0 0 1px color-mix(in oklab, ${meta.color} 34%, transparent), 0 8px 24px -10px oklch(0 0 0 / 0.26)`,
            }}
        >
            {hasInput && (
                <Handle
                    type="target"
                    position={Position.Left}
                    className="!size-2.5 !border-2 !border-background !bg-muted-foreground/80 !shadow-sm"
                />
            )}
            <div className="flex items-start gap-2.5 border-b-2 border-border px-3 py-2">
                <div
                    className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md shadow-inner"
                    style={{
                        background: `color-mix(in oklab, ${meta.color} 18%, transparent)`,
                        color: meta.color,
                    }}
                >
                    <Icon className="size-3.5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {meta.category}
                    </div>
                    <div className="text-[11px] leading-snug text-muted-foreground/90 line-clamp-2">
                        {meta.description}
                    </div>
                </div>
            </div>
            <div className="px-3 pb-2.5 pt-2">
                <div className="text-[13px] font-semibold leading-snug tracking-tight text-foreground">{data.label}</div>
                {data.summary ? (
                    <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                        {data.summary}
                    </div>
                ) : null}
                {children}
            </div>
            {hasOutput && !extraHandles && (
                <Handle
                    type="source"
                    position={Position.Right}
                    className="!size-2.5 !border-2 !border-background !bg-primary/75 !shadow-sm"
                />
            )}
            {extraHandles}
        </div>
    );
}
