import { useCallback, useEffect, useRef, useState } from "react";
import { GripVertical, Trash2, X } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import { useBackendStore } from "../../../../../store/backendStore";
import { NODE_META } from "../../../../../types";
import type { BackendFlowNode } from "../../../../../types";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";

const PANEL_WIDTH_KEY = "flowtrove-backend-config-panel-w";
const PANEL_MIN = 260;
const PANEL_MAX = 520;
const PANEL_DEFAULT = 320;

function clampWidth(n: number) {
    return Math.min(PANEL_MAX, Math.max(PANEL_MIN, Math.round(n)));
}

function readStoredWidth(): number {
    try {
        const raw = globalThis.localStorage?.getItem(PANEL_WIDTH_KEY);
        const v = raw ? Number.parseInt(raw, 10) : NaN;
        return Number.isFinite(v) ? clampWidth(v) : PANEL_DEFAULT;
    } catch {
        return PANEL_DEFAULT;
    }
}

export function NodeConfigPanel({
    backendId, node, onClose,
}: {
    backendId: string;
    node: BackendFlowNode;
    onClose: () => void;
}) {
    const update = useBackendStore((s) => s.updateNodeData);
    const remove = useBackendStore((s) => s.removeNode);
    const kind = node.data.kind;
    if (!kind) return null;
    const meta = NODE_META[kind];
    const Icon = meta.icon;

    const outputs = ["payload", "userId", "result"];

    const [width, setWidth] = useState(readStoredWidth);
    const dragRef = useRef<{ startX: number; startW: number } | null>(null);

    useEffect(() => {
        try {
            globalThis.localStorage?.setItem(PANEL_WIDTH_KEY, String(width));
        } catch {
            /* ignore */
        }
    }, [width]);

    const onResizePointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragRef.current = { startX: e.clientX, startW: width };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }, [width]);

    const onResizePointerMove = useCallback((e: React.PointerEvent) => {
        const d = dragRef.current;
        if (!d) return;
        const delta = d.startX - e.clientX;
        setWidth(clampWidth(d.startW + delta));
    }, []);

    const endResize = useCallback((e: React.PointerEvent) => {
        if (dragRef.current) {
            dragRef.current = null;
            try {
                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            } catch {
                /* ignore */
            }
        }
    }, []);

    return (
        <aside
            key={node.id}
            style={{ width }}
            className={cn(
                "relative flex h-full min-h-0 shrink-0 flex-col overflow-hidden rounded-l-lg",
                "border-l border-border/60 bg-card/90 backdrop-blur-md",
                "shadow-[inset_1px_0_0_0_oklch(1_0_0_/6%)] dark:shadow-[inset_1px_0_0_0_oklch(1_0_0_/8%)]",
                "animate-slide-in-right",
            )}
        >
            <div
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize panel"
                onPointerDown={onResizePointerDown}
                onPointerMove={onResizePointerMove}
                onPointerUp={endResize}
                onPointerCancel={endResize}
                className={cn(
                    "absolute left-0 top-0 z-10 flex h-full w-3 cursor-col-resize items-center justify-center",
                    "touch-none select-none hover:bg-primary/10",
                )}
            >
                <span className="flex h-10 w-1 items-center justify-center rounded-full bg-border/80">
                    <GripVertical className="size-3 text-muted-foreground opacity-70" aria-hidden />
                </span>
            </div>

            <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border/50 pl-4 pr-2">
                <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-md shadow-sm"
                    style={{ background: `color-mix(in oklab, ${meta.color} 14%, transparent)`, color: meta.color }}
                >
                    <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {meta.category}
                    </div>
                    <div className="truncate text-sm font-semibold leading-tight">{meta.label}</div>
                </div>
                <button type="button" onClick={onClose} className="rounded-md p-1.5 hover:bg-muted/80" aria-label="Close panel">
                    <X className="size-4 text-muted-foreground" />
                </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-4 py-4 pl-5">
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Display name</Label>
                    <Input
                        value={node.data.label}
                        onChange={(e) => update(backendId, node.id, { label: e.target.value })}
                        className="rounded-md"
                    />
                </div>

                <p className="text-[11px] leading-relaxed text-muted-foreground">{meta.description}</p>

                {kind.startsWith("data.") && (
                    <div className="space-y-3 rounded-md bg-muted/30 p-3 ring-1 ring-border/40">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Table</Label>
                            <select className="w-full rounded-md border-0 bg-background/80 px-3 py-2 text-sm shadow-sm ring-1 ring-border/60">
                                <option>users</option>
                                <option>orders</option>
                                <option>events</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Operation</Label>
                            <select className="w-full rounded-md border-0 bg-background/80 px-3 py-2 text-sm shadow-sm ring-1 ring-border/60">
                                <option>find</option>
                                <option>findMany</option>
                                <option>create</option>
                                <option>update</option>
                                <option>delete</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Filter</Label>
                            <Textarea rows={3} className="rounded-md font-mono text-xs shadow-sm ring-1 ring-border/60" defaultValue={`{ "id": "{{userId}}" }`} />
                        </div>
                    </div>
                )}

                {kind === "integration.http" && (
                    <div className="space-y-3 rounded-md bg-muted/30 p-3 ring-1 ring-border/40">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">URL</Label>
                            <Input className="rounded-md font-mono text-xs shadow-sm ring-1 ring-border/60" defaultValue="https://api.example.com/v1/items" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Method</Label>
                            <select className="w-full rounded-md border-0 bg-background/80 px-3 py-2 text-sm shadow-sm ring-1 ring-border/60">
                                <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Headers</Label>
                            <Textarea rows={3} className="rounded-md font-mono text-xs shadow-sm ring-1 ring-border/60" defaultValue={`Authorization: Bearer {{token}}`} />
                        </div>
                    </div>
                )}

                {kind === "logic.code" && (
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">JavaScript</Label>
                        <Textarea rows={8} className="rounded-md font-mono text-xs shadow-sm ring-1 ring-border/60" defaultValue={`// inputs and outputs are typed\nreturn {\n  ok: true,\n  data: input.payload,\n};`} />
                    </div>
                )}

                {kind === "logic.condition" && (
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Condition</Label>
                        <Input className="rounded-md font-mono text-xs shadow-sm ring-1 ring-border/60" defaultValue="payload.event === 'auth'" />
                        <p className="text-[11px] text-muted-foreground">Branches: <span className="text-emerald-600 dark:text-emerald-400">true</span> and <span className="text-destructive">false</span>.</p>
                    </div>
                )}

                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Summary</Label>
                    <Input
                        value={node.data.summary ?? ""}
                        placeholder="Short note on canvas"
                        onChange={(e) => update(backendId, node.id, { summary: e.target.value })}
                        className="rounded-md"
                    />
                </div>

                <div className="rounded-md bg-muted/25 p-3 ring-1 ring-border/40">
                    <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Output variables
                    </div>
                    <div className="space-y-1.5">
                        {outputs.map((o) => (
                            <div key={o} className="flex items-center justify-between gap-2 font-mono text-xs">
                                <span className="truncate text-foreground">{o}</span>
                                <button
                                    type="button"
                                    onClick={() => { void navigator.clipboard.writeText(`{{${o}}}`); toast("Copied", { description: `{{${o}}}` }); }}
                                    className="shrink-0 rounded bg-background/90 px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm ring-1 ring-border/50 hover:text-foreground"
                                >
                                    {`{{${o}}}`}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-md bg-muted/25 p-3 ring-1 ring-border/40">
                    <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Input mapping
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Input className="h-8 rounded-md font-mono text-xs shadow-sm ring-1 ring-border/60" defaultValue="userId" />
                            <span className="text-muted-foreground">←</span>
                            <select className="h-8 min-w-0 flex-1 rounded-md border-0 bg-background/80 px-2 font-mono text-xs shadow-sm ring-1 ring-border/60">
                                <option>{`{{trigger.payload.id}}`}</option>
                                <option>{`{{auth.userId}}`}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="shrink-0 border-t border-border/50 p-3 pl-5">
                <Button
                    variant="ghost"
                    className="w-full rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => { remove(backendId, node.id); onClose(); toast("Node removed"); }}
                >
                    <Trash2 className="size-4" />
                    Delete node
                </Button>
            </div>
        </aside>
    );
}
