import { useState } from "react";
import { ChevronDown, ChevronLeft, GripVertical, Search } from "lucide-react";
import { NODE_CATEGORIES, nodesByCategory, type NodeKind } from "../../../../../types";
import { Input } from "@workspace/ui/components/input";
import { useBackendStore } from "../../../../../store/backendStore";

export function NodeLibrarySidebar() {
    const collapsed = useBackendStore((s) => s.ui.sidebarCollapsed);
    const toggle = useBackendStore((s) => s.toggleSidebar);
    const [open, setOpen] = useState<Record<string, boolean>>(
        Object.fromEntries(NODE_CATEGORIES.map((c) => [c, true])),
    );
    const [q, setQ] = useState("");
    const grouped = nodesByCategory();

    const onDragStart = (e: React.DragEvent, kind: NodeKind) => {
        e.dataTransfer.setData("application/x-node-kind", kind);
        e.dataTransfer.effectAllowed = "move";
    };

    if (collapsed) {
        return (
            <div className="flex h-full min-h-0 w-12 shrink-0 flex-col border-r border-border bg-card/40">
                <button
                    onClick={toggle}
                    className="flex h-12 w-full items-center justify-center hover:bg-accent transition-colors"
                    title="Expand library"
                >
                    <ChevronLeft className="size-4 rotate-180 text-muted-foreground" />
                </button>
            </div>
        );
    }

    return (
        <aside className="flex h-full min-h-0 w-[280px] shrink-0 flex-col overflow-hidden border-r border-border bg-card/40">
            <div className="flex h-12 items-center justify-between border-b border-border px-3">
                <span className="text-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Node Library
                </span>
                <button onClick={toggle} className="rounded p-1 hover:bg-accent">
                    <ChevronLeft className="size-4 text-muted-foreground" />
                </button>
            </div>
            <div className="border-b border-border p-2">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search nodes..."
                        className="h-8 pl-7 text-xs"
                    />
                </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-2">
                {NODE_CATEGORIES.map((cat) => {
                    const items = (grouped.get(cat) ?? []).filter((n) =>
                        !q || n.label.toLowerCase().includes(q.toLowerCase()),
                    );
                    if (items.length === 0) return null;
                    const isOpen = open[cat];
                    return (
                        <div key={cat} className="mb-2">
                            <button
                                onClick={() => setOpen((s) => ({ ...s, [cat]: !s[cat] }))}
                                className="flex w-full items-center justify-between rounded px-2 py-1.5 text-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:bg-accent"
                            >
                                <span>{cat}</span>
                                <ChevronDown className={`size-3 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                            </button>
                            {isOpen && (
                                <div className="mt-1 space-y-1">
                                    {items.map((n) => {
                                        const Icon = n.icon;
                                        return (
                                            <div
                                                key={n.kind}
                                                draggable
                                                onDragStart={(e) => onDragStart(e, n.kind)}
                                                className="group flex cursor-grab items-center gap-2 rounded-md border border-transparent bg-secondary/30 px-2 py-2 hover:border-primary/40 hover:bg-secondary/60 active:cursor-grabbing transition-all"
                                                title={n.description}
                                            >
                                                <div
                                                    className="flex size-7 shrink-0 items-center justify-center rounded-md"
                                                    style={{ background: `color-mix(in oklab, ${n.color} 15%, transparent)`, color: n.color }}
                                                >
                                                    <Icon className="size-3.5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs font-medium leading-tight truncate">{n.label}</div>
                                                    <div className="text-[10px] text-muted-foreground line-clamp-1">{n.description}</div>
                                                </div>
                                                <GripVertical className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div className="mt-3 rounded-lg border border-dashed border-border p-3 text-[11px] text-muted-foreground">
                    Tip: drag a node onto the canvas, or right-click the canvas to insert.
                </div>
            </div>
        </aside>
    );
}
