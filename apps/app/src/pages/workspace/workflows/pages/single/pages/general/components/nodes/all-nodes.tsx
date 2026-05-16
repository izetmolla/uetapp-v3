import type { NodeProps } from "reactflow";
import { BaseNode } from "./base-node";
import { Handle, Position } from "reactflow";
import { Braces, GitBranch, Globe, Table2, Terminal } from "lucide-react";

export function TriggerNode(props: NodeProps) {
    return <BaseNode {...props} hasInput={false} />;
}

export function ReturnNode(props: NodeProps) {
    return <BaseNode {...props} hasOutput={false} />;
}

export function DatabaseNode(props: NodeProps) {
    return (
        <BaseNode {...props}>
            <div className="mt-2.5 flex items-center gap-2 rounded-md border-2 border-border/80 bg-muted/35 px-2 py-1.5">
                <Table2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1 font-mono text-[11px] leading-tight">
                    <span className="text-muted-foreground">table </span>
                    <span className="font-medium text-foreground">users</span>
                </div>
            </div>
        </BaseNode>
    );
}

export function HttpNode(props: NodeProps) {
    return (
        <BaseNode {...props}>
            <div className="mt-2.5 flex items-center gap-2 rounded-md border-2 border-border/80 bg-muted/35 px-2 py-1.5">
                <Globe className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                    <span className="inline-flex rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                        POST
                    </span>
                    <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">api.example.com/…</p>
                </div>
            </div>
        </BaseNode>
    );
}

export function CodeNode(props: NodeProps) {
    return (
        <BaseNode {...props}>
            <div className="mt-2.5 flex gap-2 rounded-md border-2 border-border/80 bg-muted/40 px-2 py-1.5">
                <Terminal className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <pre className="max-h-[4.5rem] overflow-hidden font-mono text-[10px] leading-relaxed text-foreground/85">
                    {`return {
  ok: true,
  data: input.payload,
};`}
                </pre>
            </div>
        </BaseNode>
    );
}

export function ConditionNode(props: NodeProps) {
    return (
        <BaseNode
            {...props}
            extraHandles={
                <>
                    <div className="pointer-events-none absolute right-[-52px] top-[42%] flex items-center gap-1 font-mono text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        <GitBranch className="size-3 opacity-80" aria-hidden />
                        true
                    </div>
                    <Handle
                        id="true"
                        type="source"
                        position={Position.Right}
                        className="!size-2.5 !border-2 !border-background !shadow-sm"
                        style={{ top: "45%", background: "oklch(0.65 0.16 155)" }}
                    />
                    <div className="pointer-events-none absolute right-[-52px] top-[70%] flex items-center gap-1 font-mono text-[10px] font-medium text-destructive">
                        <Braces className="size-3 opacity-80" aria-hidden />
                        false
                    </div>
                    <Handle
                        id="false"
                        type="source"
                        position={Position.Right}
                        className="!size-2.5 !border-2 !border-background !shadow-sm"
                        style={{ top: "75%", background: "var(--destructive)" }}
                    />
                </>
            }
        >
            <div className="mt-2.5 flex items-start gap-2 rounded-md border-2 border-border/80 bg-muted/35 px-2 py-1.5 font-mono text-[10px]">
                <span className="shrink-0 text-muted-foreground">if</span>
                <span className="min-w-0 leading-snug text-foreground">payload.event === &quot;auth&quot;</span>
            </div>
        </BaseNode>
    );
}

export function DefaultNode(props: NodeProps) {
    return <BaseNode {...props} />;
}
