import "reactflow/dist/style.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, Layers, Map as MapIcon, Settings2, Trash2 } from "lucide-react";
import ReactFlow, {
    Background, BackgroundVariant, Controls, MiniMap, Panel,
    type Connection, type Edge, type Node, type NodeTypes,
    ReactFlowProvider, useReactFlow,
} from "reactflow";
import {
    TriggerNode, ReturnNode, DatabaseNode, HttpNode, CodeNode, ConditionNode, DefaultNode,
} from "./nodes/all-nodes";
import { GroupFrameNode } from "./nodes/group-node";
import { useBackendStore, getAbsoluteNodePosition } from "../../../../../store/backendStore";
import type { Backend, BackendFlowNode, NodeKind } from "../../../../../types";
import { NODE_META, NODE_CATEGORIES, nodesByCategory } from "../../../../../types";
import { toast } from "sonner";
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { cn } from "@workspace/ui/lib/utils";

const MINIMAP_STORAGE_KEY = "flowtrove-backend-editor-minimap-visible";

const nodeTypes: NodeTypes = {
    group: GroupFrameNode,
    "trigger": TriggerNode,
    "return": ReturnNode,
    "database": DatabaseNode,
    "http": HttpNode,
    "code": CodeNode,
    "condition": ConditionNode,
    "default-node": DefaultNode,
};

const defaultEdgeOptions = { animated: true, type: "smoothstep" as const };
const fitViewOptions = { padding: 0.2 };
const proOptions = { hideAttribution: true };

function parseDim(value: unknown, fallback: number): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const n = Number.parseFloat(value);
        if (Number.isFinite(n)) return n;
    }
    return fallback;
}

function depthInTree(nodes: BackendFlowNode[], id: string): number {
    let d = 0;
    let cur: BackendFlowNode | undefined = nodes.find((n) => n.id === id);
    while (cur?.parentId) {
        const pid = cur.parentId;
        d++;
        cur = nodes.find((n) => n.id === pid);
    }
    return d;
}

function groupFlowBounds(nodes: BackendFlowNode[], g: BackendFlowNode) {
    const { x, y } = getAbsoluteNodePosition(nodes, g.id);
    const w = parseDim(g.width ?? g.style?.width, 280);
    const h = parseDim(g.height ?? g.style?.height, 200);
    return { x, y, w, h };
}

/** Deepest group under the cursor, or the group you right‑clicked / whose child you clicked. See https://reactflow.dev/examples/grouping/sub-flows */
function findEnclosingGroupId(
    nodes: BackendFlowNode[],
    flowPoint: { x: number; y: number },
    clicked: Node | null,
): string | undefined {
    if (clicked) {
        const bn = nodes.find((n) => n.id === clicked.id);
        if (bn?.type === "group") return bn.id;
        let pid = bn?.parentId;
        while (pid) {
            const p = nodes.find((n) => n.id === pid);
            if (p?.type === "group") return p.id;
            pid = p?.parentId;
        }
    }
    const groups = nodes.filter((n) => n.type === "group");
    let best: string | undefined;
    let bestDepth = -1;
    for (const g of groups) {
        const b = groupFlowBounds(nodes, g);
        const inside =
            flowPoint.x >= b.x &&
            flowPoint.x <= b.x + b.w &&
            flowPoint.y >= b.y &&
            flowPoint.y <= b.y + b.h;
        if (inside) {
            const d = depthInTree(nodes, g.id);
            if (d > bestDepth) {
                bestDepth = d;
                best = g.id;
            }
        }
    }
    return best;
}

/** Group targeted for fill / resize hints: direct right‑click on group, or pane menu opened inside a group. */
function resolveStylingGroupId(
    nodes: BackendFlowNode[],
    clicked: Node | null,
    enclosingGroupId?: string,
): string | undefined {
    if (clicked?.type === "group") return clicked.id;
    if (!clicked && enclosingGroupId) {
        const g = nodes.find((n) => n.id === enclosingGroupId);
        if (g?.type === "group") return enclosingGroupId;
    }
    return undefined;
}

const GROUP_FILL_PRESETS: { label: string; backgroundColor: string; borderColor: string }[] = [
    {
        label: "Muted",
        backgroundColor: "color-mix(in oklab, var(--muted) 38%, transparent)",
        borderColor: "color-mix(in oklab, var(--border) 88%, transparent)",
    },
    {
        label: "Violet",
        backgroundColor: "color-mix(in oklab, oklch(0.58 0.19 290) 22%, transparent)",
        borderColor: "color-mix(in oklab, oklch(0.62 0.14 290) 45%, transparent)",
    },
    {
        label: "Blue",
        backgroundColor: "color-mix(in oklab, oklch(0.55 0.14 250) 22%, transparent)",
        borderColor: "color-mix(in oklab, oklch(0.58 0.12 250) 50%, transparent)",
    },
    {
        label: "Teal",
        backgroundColor: "color-mix(in oklab, oklch(0.55 0.1 195) 24%, transparent)",
        borderColor: "color-mix(in oklab, oklch(0.55 0.08 195) 48%, transparent)",
    },
    {
        label: "Amber",
        backgroundColor: "color-mix(in oklab, oklch(0.72 0.14 75) 20%, transparent)",
        borderColor: "color-mix(in oklab, oklch(0.65 0.12 75) 42%, transparent)",
    },
    {
        label: "Rose",
        backgroundColor: "color-mix(in oklab, oklch(0.62 0.16 15) 20%, transparent)",
        borderColor: "color-mix(in oklab, oklch(0.58 0.12 15) 45%, transparent)",
    },
];

function detectsCycle(edges: Edge[], source: string, target: string): boolean {
    // BFS from target — if we can reach source, adding edge would cycle
    const adj = new Map<string, string[]>();
    for (const e of edges) {
        if (!adj.has(e.source)) adj.set(e.source, []);
        adj.get(e.source)!.push(e.target);
    }
    const stack = [target];
    const seen = new Set<string>();
    while (stack.length) {
        const cur = stack.pop()!;
        if (cur === source) return true;
        if (seen.has(cur)) continue;
        seen.add(cur);
        for (const n of adj.get(cur) ?? []) stack.push(n);
    }
    return false;
}

function readMinimapPreference(): boolean {
    try {
        return globalThis.localStorage?.getItem(MINIMAP_STORAGE_KEY) !== "0";
    } catch {
        return true;
    }
}

function writeMinimapPreference(visible: boolean) {
    try {
        globalThis.localStorage?.setItem(MINIMAP_STORAGE_KEY, visible ? "1" : "0");
    } catch {
        /* ignore */
    }
}

function CanvasInner({ backend }: { backend: Backend }) {
    const apply = useBackendStore((s) => s.applyNodeChanges);
    const applyE = useBackendStore((s) => s.applyEdgeChanges);
    const connect = useBackendStore((s) => s.connect);
    const addNode = useBackendStore((s) => s.addNode);
    const addGroup = useBackendStore((s) => s.addGroup);
    const updateNodeStyle = useBackendStore((s) => s.updateNodeStyle);
    const updateNodeData = useBackendStore((s) => s.updateNodeData);
    const sendGroupToBack = useBackendStore((s) => s.sendGroupToBack);
    const removeNode = useBackendStore((s) => s.removeNode);
    const setSelected = useBackendStore((s) => s.setSelectedNode);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();
    const [ctxMenu, setCtxMenu] = useState<{
        x: number;
        y: number;
        flow: { x: number; y: number };
        enclosingGroupId?: string;
        /** Group that receives appearance edits from this menu. */
        stylingGroupId?: string;
    } | null>(null);
    const [showMinimap, setShowMinimap] = useState(readMinimapPreference);
    const [groupLabelDraft, setGroupLabelDraft] = useState("");

    useEffect(() => {
        if (!ctxMenu?.stylingGroupId) return;
        const g = backend.nodes.find((n) => n.id === ctxMenu.stylingGroupId);
        setGroupLabelDraft(g?.data.label ?? "Group");
    }, [ctxMenu?.stylingGroupId, backend.nodes, ctxMenu]);

    useEffect(() => {
        writeMinimapPreference(showMinimap);
    }, [showMinimap]);

    const onConnect = useCallback((c: Connection) => {
        if (!c.source || !c.target) return;
        if (detectsCycle(backend.edges as unknown as Edge[], c.source, c.target)) {
            toast.error("Cycle detected", { description: "Nodes can only flow left to right." });
            return;
        }
        connect(backend.id, c);
    }, [backend.edges, backend.id, connect]);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const kind = e.dataTransfer.getData("application/x-node-kind") as NodeKind;
        if (!kind) return;
        const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        addNode(backend.id, kind, position);
        toast(`Added ${NODE_META[kind].label}`);
    }, [addNode, backend.id, screenToFlowPosition]);

    const grouped = useMemo(() => nodesByCategory(), []);

    const openContextMenu = useCallback(
        (e: React.MouseEvent, clickedNode: Node | null) => {
            const flow = screenToFlowPosition({ x: e.clientX, y: e.clientY });
            const rect = wrapperRef.current?.getBoundingClientRect();
            const enclosingGroupId = findEnclosingGroupId(backend.nodes, flow, clickedNode);
            const stylingGroupId = resolveStylingGroupId(backend.nodes, clickedNode, enclosingGroupId);
            setCtxMenu({
                x: e.clientX - (rect?.left ?? 0),
                y: e.clientY - (rect?.top ?? 0),
                flow,
                enclosingGroupId,
                stylingGroupId,
            });
        },
        [backend.nodes, screenToFlowPosition],
    );

    const onPaneContextMenu = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            openContextMenu(e, null);
        },
        [openContextMenu],
    );

    const onNodeContextMenu = useCallback(
        (e: React.MouseEvent, node: Node) => {
            e.preventDefault();
            openContextMenu(e, node);
        },
        [openContextMenu],
    );

    return (
        <div
            ref={wrapperRef}
            className="relative h-full min-h-0 min-w-0 w-full overflow-hidden"
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={() => setCtxMenu(null)}
        >
            <ReactFlow
                className="flow-backend-canvas h-full min-h-0 w-full min-w-0 bg-muted/20 dark:bg-muted/15"
                nodes={backend.nodes as unknown as Node[]}
                edges={backend.edges as unknown as Edge[]}
                nodeTypes={nodeTypes}
                onNodesChange={(c) => apply(backend.id, c)}
                onEdgesChange={(c) => applyE(backend.id, c)}
                onConnect={onConnect}
                onNodeClick={(_, n) => setSelected(n.id)}
                onPaneClick={() => setSelected(null)}
                onPaneContextMenu={onPaneContextMenu}
                onNodeContextMenu={onNodeContextMenu}
                defaultEdgeOptions={defaultEdgeOptions}
                fitView
                fitViewOptions={fitViewOptions}
                minZoom={0.2}
                maxZoom={1.5}
                proOptions={proOptions}
                deleteKeyCode={["Backspace", "Delete"]}
            >
                <Background
                    variant={BackgroundVariant.Lines}
                    gap={22}
                    lineWidth={0.6}
                    className="opacity-40 dark:opacity-25"
                    color="var(--border)"
                />
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={22}
                    size={1.25}
                    className="opacity-30 dark:opacity-20"
                    color="oklch(0.55 0.12 275 / 0.35)"
                />
                <Panel position="top-right" className="m-2 flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="secondary"
                                size="icon-sm"
                                className="size-8 border border-border bg-card/95 shadow-sm backdrop-blur-sm"
                                aria-label="Canvas view options"
                            >
                                <Settings2 className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                Canvas
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                checked={showMinimap}
                                onCheckedChange={(v) => setShowMinimap(v === true)}
                                className="text-sm"
                            >
                                <span className="flex items-center gap-2">
                                    <MapIcon className="size-3.5 text-muted-foreground" aria-hidden />
                                    Show minimap
                                </span>
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Panel>
                <Controls position="bottom-left" />
                {showMinimap ? (
                    <MiniMap
                        pannable
                        zoomable
                        position="bottom-right"
                        nodeStrokeWidth={1}
                        nodeBorderRadius={4}
                        style={{ width: 120, height: 88 }}
                        className={cn(
                            "!m-2 overflow-hidden rounded-md border border-border bg-card/95 shadow-md",
                            "[&_svg]:block",
                        )}
                        nodeColor={() => "oklch(0.62 0.21 280)"}
                        maskColor="rgba(10, 10, 15, 0.72)"
                        maskStrokeColor="oklch(0.72 0.12 280)"
                        maskStrokeWidth={1}
                    />
                ) : null}
            </ReactFlow>

            {ctxMenu && (
                <Popover open onOpenChange={(o) => { if (!o) setCtxMenu(null); }}>
                    <PopoverTrigger asChild>
                        <div style={{ position: "absolute", left: ctxMenu.x, top: ctxMenu.y, width: 1, height: 1 }} />
                    </PopoverTrigger>
                    <PopoverContent align="start" side="right" className="w-64 p-1 max-h-[60vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {ctxMenu.stylingGroupId ? (
                            <>
                                <div className="px-2 py-1 text-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                    Group appearance
                                </div>
                                <div className="space-y-1.5 px-2 pb-2">
                                    <Label htmlFor="ctx-group-label" className="text-xs text-muted-foreground">
                                        Group name
                                    </Label>
                                    <Input
                                        id="ctx-group-label"
                                        value={groupLabelDraft}
                                        onChange={(e) => setGroupLabelDraft(e.target.value)}
                                        onBlur={() => {
                                            const gid = ctxMenu.stylingGroupId;
                                            if (!gid) return;
                                            const next = groupLabelDraft.trim() || "Group";
                                            updateNodeData(backend.id, gid, { label: next });
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                (e.target as HTMLInputElement).blur();
                                            }
                                        }}
                                        className="h-8 text-sm"
                                        autoComplete="off"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        sendGroupToBack(backend.id, ctxMenu.stylingGroupId!);
                                        setCtxMenu(null);
                                        toast("Group sent to back");
                                    }}
                                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                                >
                                    <Layers className="size-3.5 text-muted-foreground" aria-hidden />
                                    <span>Send to back</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const gid = ctxMenu.stylingGroupId!;
                                        removeNode(backend.id, gid);
                                        const sel = useBackendStore.getState().ui.selectedNodeId;
                                        if (sel) {
                                            const nodes =
                                                useBackendStore.getState().getBackend(backend.id)?.nodes ?? [];
                                            if (!nodes.some((n) => n.id === sel)) {
                                                setSelected(null);
                                            }
                                        }
                                        setCtxMenu(null);
                                        toast("Group deleted", {
                                            description: "Nodes inside this group were removed too.",
                                        });
                                    }}
                                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="size-3.5 shrink-0 opacity-90" aria-hidden />
                                    <span>Delete group</span>
                                </button>
                                <p className="px-2 pb-1.5 text-[10px] leading-snug text-muted-foreground">
                                    Click the group to select it, then drag the handles on the sides and corners to resize.
                                </p>
                                <div className="grid grid-cols-3 gap-1.5 px-2 pb-2">
                                    {GROUP_FILL_PRESETS.map((preset) => (
                                        <button
                                            key={preset.label}
                                            type="button"
                                            title={preset.label}
                                            onClick={() => {
                                                updateNodeStyle(backend.id, ctxMenu.stylingGroupId!, {
                                                    backgroundColor: preset.backgroundColor,
                                                    borderColor: preset.borderColor,
                                                });
                                                setCtxMenu(null);
                                                toast(`Group fill: ${preset.label}`);
                                            }}
                                            className="h-8 rounded-md border border-border/80 shadow-sm ring-offset-background transition hover:ring-2 hover:ring-ring/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            style={{
                                                backgroundColor: preset.backgroundColor,
                                                borderColor: preset.borderColor,
                                            }}
                                            aria-label={`Set group color ${preset.label}`}
                                        />
                                    ))}
                                </div>
                                <div className="my-1 h-px bg-border" role="separator" />
                            </>
                        ) : null}
                        <button
                            type="button"
                            onClick={() => {
                                addGroup(backend.id, ctxMenu.flow, ctxMenu.enclosingGroupId
                                    ? { parentId: ctxMenu.enclosingGroupId }
                                    : undefined);
                                setCtxMenu(null);
                                toast(ctxMenu.enclosingGroupId ? "Added nested group" : "Added group");
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                        >
                            <LayoutGrid className="size-3.5 text-muted-foreground" aria-hidden />
                            <span>{ctxMenu.enclosingGroupId ? "Add group inside" : "Add group"}</span>
                        </button>
                        {ctxMenu.enclosingGroupId ? (
                            <p className="px-2 pb-1 text-[10px] leading-snug text-muted-foreground">
                                Nodes below are added inside &ldquo;
                                {backend.nodes.find((n) => n.id === ctxMenu.enclosingGroupId)?.data.label ?? "Group"}
                                &rdquo; (relative layout).
                            </p>
                        ) : null}
                        <div className="my-1 h-px bg-border" role="separator" />
                        <div className="px-2 py-1 text-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            Add node
                        </div>
                        {NODE_CATEGORIES.map((cat) => (
                            <div key={cat}>
                                <div className="px-2 pt-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">{cat}</div>
                                {(grouped.get(cat) ?? []).map((n) => {
                                    const Icon = n.icon;
                                    return (
                                        <button
                                            key={n.kind}
                                            onClick={() => {
                                                addNode(
                                                    backend.id,
                                                    n.kind,
                                                    ctxMenu.flow,
                                                    ctxMenu.enclosingGroupId
                                                        ? { parentId: ctxMenu.enclosingGroupId }
                                                        : undefined,
                                                );
                                                setCtxMenu(null);
                                                toast(
                                                    ctxMenu.enclosingGroupId
                                                        ? `Added ${n.label} to group`
                                                        : `Added ${n.label}`,
                                                );
                                            }}
                                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                                        >
                                            <Icon className="size-3.5" style={{ color: n.color }} />
                                            <span>{n.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}

export function FlowCanvas({ backend }: { backend: Backend }) {
    return (
        <ReactFlowProvider>
            <div className="h-full min-h-0 min-w-0 w-full">
                <CanvasInner backend={backend} />
            </div>
        </ReactFlowProvider>
    );
}
