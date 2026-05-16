import { create } from "zustand";
import type { CSSProperties } from "react";
import {
    type Backend, type BackendFlowEdge, type BackendFlowNode, type HttpMethod, type NodeKind, type TriggerType,
    NODE_META
} from "../types";
import {
    applyNodeChanges, applyEdgeChanges,
    type NodeChange, type EdgeChange, type Connection,
} from "reactflow";
import { newUuid } from "@/components/workflow/lib/id";

/** Absolute flow position (sums relative positions up the parent chain). */
export function getAbsoluteNodePosition(nodes: BackendFlowNode[], nodeId: string): { x: number; y: number } {
    const chain: BackendFlowNode[] = [];
    let cur: BackendFlowNode | undefined = nodes.find((n) => n.id === nodeId);
    while (cur) {
        chain.unshift(cur);
        const pid = cur.parentId;
        if (!pid) break;
        cur = nodes.find((n) => n.id === pid);
    }
    return chain.reduce(
        (acc, n) => ({ x: acc.x + n.position.x, y: acc.y + n.position.y }),
        { x: 0, y: 0 },
    );
}

function isStrictDescendantOf(nodes: BackendFlowNode[], nodeId: string, ancestorId: string): boolean {
    let cur: BackendFlowNode | undefined = nodes.find((n) => n.id === nodeId);
    while (cur?.parentId) {
        const pid = cur.parentId;
        if (pid === ancestorId) return true;
        cur = nodes.find((n) => n.id === pid);
    }
    return false;
}

/** Parents must appear before children; new nodes are inserted after the parent’s subtree. */
function insertNodeInTreeOrder(nodes: BackendFlowNode[], newNode: BackendFlowNode): BackendFlowNode[] {
    if (!newNode.parentId) {
        return [...nodes, newNode];
    }
    const pIdx = nodes.findIndex((n) => n.id === newNode.parentId);
    if (pIdx === -1) {
        return [...nodes, newNode];
    }
    let last = pIdx;
    for (let i = pIdx + 1; i < nodes.length; i++) {
        if (isStrictDescendantOf(nodes, nodes[i].id, newNode.parentId)) {
            last = i;
        } else {
            break;
        }
    }
    const next = [...nodes];
    next.splice(last + 1, 0, newNode);
    return next;
}

function buildNode(kind: NodeKind, x: number, y: number, summary?: string): BackendFlowNode {
    const m = NODE_META[kind];
    return {
        id: newUuid(),
        type: m.rfType,
        position: { x, y },
        data: { kind, label: m.label, icon: kind, summary },
    };
}

function buildGroupNode(relX: number, relY: number, parentId?: string): BackendFlowNode {
    const node: BackendFlowNode = {
        id: newUuid(),
        type: "group",
        position: { x: relX, y: relY },
        style: {
            width: 280,
            height: 200,
            backgroundColor: "color-mix(in oklab, var(--muted) 38%, transparent)",
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: "color-mix(in oklab, var(--border) 88%, transparent)",
            borderRadius: 8,
        },
        data: { label: "Group" },
    };
    if (parentId) {
        node.parentId = parentId;
        node.extent = "parent";
    }
    return node;
}

const seed = (): Backend[] => {
    const make = (
        id: string,
        name: string, method: Backend["method"], path: string, status: Backend["status"],
        trigger: TriggerType, runs: number, kinds: NodeKind[], description: string,
    ): Backend => {
        const nodes: BackendFlowNode[] = kinds.map((k, i) =>
            buildNode(k, 80 + i * 240, 180),
        );
        const edges: BackendFlowEdge[] = [];
        for (let i = 0; i < nodes.length - 1; i++) {
            edges.push({
                id: newUuid(),
                source: nodes[i].id, target: nodes[i + 1].id,
                animated: true,
            });
        }
        return {
            id, name, method, path, status, trigger, description,
            callstack: kinds.map((k) => ({ kind: k, label: NODE_META[k].label, icon: k })),
            nodes, edges, run_count: runs,
            updatedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 48).toISOString(),
        };
    };

    return [
        make("b_ruw6xlce", "Get User Profile", "GET", "/api/users/:id", "active", "rest", 2431,
            ["trigger.http", "integration.auth", "data.query", "logic.transform", "util.return"],
            "Returns the authenticated user's profile with merged preferences."),
        make("b_demo_orders", "Create Order", "POST", "/api/orders", "active", "rest", 891,
            ["trigger.http", "logic.transform", "data.insert", "integration.email", "util.return"],
            "Validates payload, creates an order row, and sends a confirmation email."),
        make("b_demo_weekly", "Send Weekly Report", "CRON", "0 9 * * 1", "draft", "schedule", 12,
            ["trigger.scheduler", "data.query", "logic.transform", "logic.loop", "integration.email"],
            "Aggregates last week's metrics and emails each workspace owner."),
        make("b_demo_webhook", "Webhook Handler", "POST", "/api/webhooks/stripe", "error", "event", 47,
            ["trigger.http", "logic.condition", "data.update", "util.return"],
            "Handles Stripe webhooks. Routes by event type, then updates the matching record."),
        make("b_demo_reindex", "Refresh Search Index", "PUT", "/api/admin/reindex", "active", "rest", 18,
            ["trigger.http", "integration.auth", "data.query", "integration.http", "util.return"],
            "Pulls latest documents and pushes them to the search service."),
    ];
};

interface UIState {
    viewMode: "grid" | "list";
    createModalOpen: boolean;
    selectedNodeId: string | null;
    sidebarCollapsed: boolean;
    search: string;
}

interface BackendStore {
    backends: Backend[];
    ui: UIState;

    setViewMode: (m: UIState["viewMode"]) => void;
    setSearch: (s: string) => void;
    openCreate: (open: boolean) => void;
    setSelectedNode: (id: string | null) => void;
    toggleSidebar: () => void;

    createBackend: (input: {
        name: string; method: HttpMethod; path: string;
        description: string; trigger: TriggerType;
    }) => Backend;
    deleteBackend: (id: string) => void;
    duplicateBackend: (id: string) => void;
    renameBackend: (id: string, name: string) => void;

    // Editor
    getBackend: (id: string) => Backend | undefined;
    applyNodeChanges: (id: string, changes: NodeChange[]) => void;
    applyEdgeChanges: (id: string, changes: EdgeChange[]) => void;
    connect: (id: string, conn: Connection) => void;
    addNode: (
        id: string,
        kind: NodeKind,
        position: { x: number; y: number },
        opts?: { parentId?: string },
    ) => void;
    addGroup: (
        id: string,
        position: { x: number; y: number },
        opts?: { parentId?: string },
    ) => void;
    updateNodeData: (id: string, nodeId: string, data: Partial<BackendFlowNode["data"]>) => void;
    updateNodeStyle: (id: string, nodeId: string, patch: CSSProperties) => void;
    /** Lower stacking index so other nodes paint above the group frame. */
    sendGroupToBack: (id: string, groupNodeId: string) => void;
    removeNode: (id: string, nodeId: string) => void;
}

export const useBackendStore = create<BackendStore>((set, get) => ({
    backends: seed(),
    ui: {
        viewMode: "grid",
        createModalOpen: false,
        selectedNodeId: null,
        sidebarCollapsed: false,
        search: "",
    },

    setViewMode: (m) => set((s) => ({ ui: { ...s.ui, viewMode: m } })),
    setSearch: (search) => set((s) => ({ ui: { ...s.ui, search } })),
    openCreate: (open) => set((s) => ({ ui: { ...s.ui, createModalOpen: open } })),
    setSelectedNode: (id) => set((s) => ({ ui: { ...s.ui, selectedNodeId: id } })),
    toggleSidebar: () => set((s) => ({ ui: { ...s.ui, sidebarCollapsed: !s.ui.sidebarCollapsed } })),

    createBackend: ({ name, method, path, description, trigger }) => {
        const trig: NodeKind = trigger === "schedule" ? "trigger.scheduler" : "trigger.http";
        const nodes = [
            buildNode(trig, 80, 180),
            buildNode("util.return", 480, 180),
        ];
        const edges: BackendFlowEdge[] = [{
            id: newUuid(),
            source: nodes[0].id, target: nodes[1].id, animated: true,
        }];
        const b: Backend = {
            id: newUuid(), name, method, path, status: "draft", trigger, description,
            callstack: [
                { kind: trig, label: NODE_META[trig].label, icon: trig },
                { kind: "util.return", label: "Return Response", icon: "util.return" },
            ],
            nodes, edges, run_count: 0,
            updatedAt: new Date().toISOString(),
        };
        set((s) => ({ backends: [b, ...s.backends] }));
        return b;
    },

    deleteBackend: (id) => set((s) => ({ backends: s.backends.filter((b) => b.id !== id) })),
    duplicateBackend: (id) => set((s) => {
        const b = s.backends.find((x) => x.id === id);
        if (!b) return s;
        const copy: Backend = { ...b, id: newUuid(), name: `${b.name} (copy)`, updatedAt: new Date().toISOString() };
        return { backends: [copy, ...s.backends] };
    }),
    renameBackend: (id, name) => set((s) => ({
        backends: s.backends.map((b) => b.id === id ? { ...b, name, updatedAt: new Date().toISOString() } : b),
    })),

    getBackend: (id) => get().backends.find((b) => b.id === id),

    applyNodeChanges: (id, changes) => set((s) => ({
        backends: s.backends.map((b) => b.id === id
            ? { ...b, nodes: applyNodeChanges(changes, b.nodes as never) as never as BackendFlowNode[] }
            : b),
    })),
    applyEdgeChanges: (id, changes) => set((s) => ({
        backends: s.backends.map((b) => b.id === id
            ? { ...b, edges: applyEdgeChanges(changes, b.edges as never) as never as BackendFlowEdge[] }
            : b),
    })),
    connect: (id, conn) => set((s) => ({
        backends: s.backends.map((b) => {
            if (b.id !== id) return b;
            if (!conn.source || !conn.target) return b;
            // prevent self / dup
            if (conn.source === conn.target) return b;
            if (b.edges.some((e) => e.source === conn.source && e.target === conn.target && e.sourceHandle === conn.sourceHandle)) return b;
            return {
                ...b,
                edges: [...b.edges, {
                    id: newUuid(),
                    source: conn.source, target: conn.target,
                    sourceHandle: conn.sourceHandle, targetHandle: conn.targetHandle,
                    animated: true,
                }],
            };
        }),
    })),
    addNode: (id, kind, position, opts) => set((s) => ({
        backends: s.backends.map((b) => {
            if (b.id !== id) return b;
            let relX = position.x;
            let relY = position.y;
            if (opts?.parentId) {
                const pAbs = getAbsoluteNodePosition(b.nodes, opts.parentId);
                relX = position.x - pAbs.x;
                relY = position.y - pAbs.y;
            }
            const node: BackendFlowNode = {
                ...buildNode(kind, relX, relY),
                ...(opts?.parentId ? { parentId: opts.parentId, extent: "parent" as const } : {}),
            };
            return { ...b, nodes: insertNodeInTreeOrder(b.nodes, node) };
        }),
    })),
    addGroup: (id, position, opts) => set((s) => ({
        backends: s.backends.map((b) => {
            if (b.id !== id) return b;
            let relX = position.x;
            let relY = position.y;
            if (opts?.parentId) {
                const pAbs = getAbsoluteNodePosition(b.nodes, opts.parentId);
                relX = position.x - pAbs.x;
                relY = position.y - pAbs.y;
            }
            const group = buildGroupNode(relX, relY, opts?.parentId);
            return { ...b, nodes: insertNodeInTreeOrder(b.nodes, group) };
        }),
    })),
    updateNodeData: (id, nodeId, data) => set((s) => ({
        backends: s.backends.map((b) => b.id === id
            ? { ...b, nodes: b.nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n) }
            : b),
    })),
    updateNodeStyle: (id, nodeId, patch) => set((s) => ({
        backends: s.backends.map((b) => b.id === id
            ? {
                ...b,
                nodes: b.nodes.map((n) =>
                    n.id === nodeId ? { ...n, style: { ...n.style, ...patch } } : n,
                ),
            }
            : b),
    })),
    sendGroupToBack: (id, groupNodeId) => set((s) => ({
        backends: s.backends.map((b) => {
            if (b.id !== id) return b;
            const target = b.nodes.find((n) => n.id === groupNodeId);
            if (!target || target.type !== "group") return b;
            const layers = b.nodes.map((n) => n.zIndex ?? 0);
            const minZ = layers.length > 0 ? Math.min(...layers) : 0;
            return {
                ...b,
                nodes: b.nodes.map((n) =>
                    n.id === groupNodeId ? { ...n, zIndex: minZ - 1 } : n,
                ),
            };
        }),
    })),
    removeNode: (id, nodeId) => set((s) => ({
        backends: s.backends.map((b) => {
            if (b.id !== id) return b;
            const ids = new Set<string>();
            const stack = [nodeId];
            while (stack.length) {
                const nid = stack.pop()!;
                if (ids.has(nid)) continue;
                ids.add(nid);
                for (const ch of b.nodes) {
                    if (ch.parentId === nid) stack.push(ch.id);
                }
            }
            return {
                ...b,
                nodes: b.nodes.filter((n) => !ids.has(n.id)),
                edges: b.edges.filter((e) => !ids.has(e.source) && !ids.has(e.target)),
            };
        }),
    })),
}));
