import { NODE_META, type NodeKind } from "../../../types";
import { ArrowRight } from "lucide-react";

export function CallstackPills({
    kinds, max = 3, className = "",
}: { kinds: NodeKind[]; max?: number; className?: string }) {
    const visible = kinds.slice(0, max);
    const extra = kinds.length - visible.length;
    return (
        <div className={`flex items-center gap-1 flex-wrap ${className}`}>
            {visible.map((k, i) => {
                const m = NODE_META[k];
                const Icon = m.icon;
                return (
                    <div key={`${k}-${i}`} className="flex items-center gap-1">
                        <div
                            className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2 py-1 text-mono text-[10px] uppercase tracking-wide text-foreground/90"
                            style={{ borderColor: `color-mix(in oklab, ${m.color} 30%, var(--border))` }}
                        >
                            <Icon className="size-3" style={{ color: m.color }} />
                            <span className="truncate max-w-[80px]">{m.label}</span>
                        </div>
                        {i < visible.length - 1 && (
                            <ArrowRight className="size-3 text-muted-foreground/60" />
                        )}
                    </div>
                );
            })}
            {extra > 0 && (
                <span className="text-mono text-[10px] uppercase rounded-md border border-border bg-muted/30 px-2 py-1 text-muted-foreground">
                    +{extra} more
                </span>
            )}
        </div>
    );
}
