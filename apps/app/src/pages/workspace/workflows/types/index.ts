import type { CSSProperties } from "react";
import {
    Globe, Clock, Database, FileInput, RefreshCw, GitBranch, Repeat, Code2,
    Wand2, Send, Mail, ShieldCheck, Webhook, Variable, CornerDownLeft, Bug,
    type LucideIcon,
} from "lucide-react";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type BackendStatus = "active" | "draft" | "error";
export type TriggerType = "rest" | "schedule" | "event";

export type NodeKind =
    | "trigger.http"
    | "trigger.scheduler"
    | "data.query"
    | "data.insert"
    | "data.update"
    | "logic.condition"
    | "logic.loop"
    | "logic.code"
    | "logic.transform"
    | "integration.http"
    | "integration.email"
    | "integration.auth"
    | "integration.webhook"
    | "util.variable"
    | "util.return"
    | "util.log";

export interface CallstackPreviewNode {
    kind: NodeKind;
    label: string;
    icon: string;
}

/** Flow node payload. `kind` is omitted for `type: "group"` container nodes. */
export interface BackendFlowNodeData {
    kind?: NodeKind;
    label: string;
    icon?: string;
    summary?: string;
    config?: Record<string, unknown>;
}

export interface BackendFlowNode {
    id: string;
    type: string; // react flow node type (e.g. "group", "trigger", …)
    position: { x: number; y: number };
    /** Child nodes are positioned relative to their parent (React Flow sub-flows). */
    parentId?: string;
    /** Keep draggable nodes inside their parent group. */
    extent?: "parent";
    style?: CSSProperties;
    /** Set by React Flow when resizing (with `NodeResizer`). */
    width?: number;
    height?: number;
    /** Stacking order on the canvas (e.g. lower = behind other nodes). */
    zIndex?: number;
    data: BackendFlowNodeData;
}

export interface BackendFlowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    label?: string;
    animated?: boolean;
}

export interface Backend {
    id: string;
    name: string;
    description: string;
    method: HttpMethod | "CRON";
    path: string;
    status: BackendStatus;
    trigger: TriggerType;
    callstack: CallstackPreviewNode[];
    nodes: BackendFlowNode[];
    edges: BackendFlowEdge[];
    run_count: number;
    updatedAt: string;
}



export interface NodeMeta {
    kind: NodeKind;
    label: string;
    description: string;
    category: "Triggers" | "Data" | "Logic" | "Integrations" | "Utilities";
    icon: LucideIcon;
    color: string; // hsl-ish via design token name
    rfType: string;
}

export const NODE_META: Record<NodeKind, NodeMeta> = {
    "trigger.http": { kind: "trigger.http", label: "HTTP Request", description: "Entry point — incoming HTTP request", category: "Triggers", icon: Globe, color: "var(--cyan)", rfType: "trigger" },
    "trigger.scheduler": { kind: "trigger.scheduler", label: "Scheduler", description: "Run on a cron schedule", category: "Triggers", icon: Clock, color: "var(--cyan)", rfType: "trigger" },
    "data.query": { kind: "data.query", label: "Database Query", description: "Query rows from a table", category: "Data", icon: Database, color: "var(--success)", rfType: "database" },
    "data.insert": { kind: "data.insert", label: "Database Insert", description: "Insert a new row", category: "Data", icon: FileInput, color: "var(--success)", rfType: "database" },
    "data.update": { kind: "data.update", label: "Database Update", description: "Update existing rows", category: "Data", icon: RefreshCw, color: "var(--success)", rfType: "database" },
    "logic.condition": { kind: "logic.condition", label: "Condition", description: "If / else branching", category: "Logic", icon: GitBranch, color: "var(--warning)", rfType: "condition" },
    "logic.loop": { kind: "logic.loop", label: "Loop", description: "Iterate over an array", category: "Logic", icon: Repeat, color: "var(--warning)", rfType: "default-node" },
    "logic.code": { kind: "logic.code", label: "Custom Code", description: "Run a JS snippet", category: "Logic", icon: Code2, color: "var(--warning)", rfType: "code" },
    "logic.transform": { kind: "logic.transform", label: "Transform", description: "Map / reshape data", category: "Logic", icon: Wand2, color: "var(--warning)", rfType: "default-node" },
    "integration.http": { kind: "integration.http", label: "HTTP Request", description: "Outgoing HTTP call", category: "Integrations", icon: Send, color: "var(--violet)", rfType: "http" },
    "integration.email": { kind: "integration.email", label: "Send Email", description: "Send a transactional email", category: "Integrations", icon: Mail, color: "var(--violet)", rfType: "default-node" },
    "integration.auth": { kind: "integration.auth", label: "Auth Check", description: "Validate JWT / session", category: "Integrations", icon: ShieldCheck, color: "var(--violet)", rfType: "default-node" },
    "integration.webhook": { kind: "integration.webhook", label: "Send Webhook", description: "POST to external URL", category: "Integrations", icon: Webhook, color: "var(--violet)", rfType: "default-node" },
    "util.variable": { kind: "util.variable", label: "Set Variable", description: "Create a named variable", category: "Utilities", icon: Variable, color: "var(--muted-foreground)", rfType: "default-node" },
    "util.return": { kind: "util.return", label: "Return Response", description: "Final response output", category: "Utilities", icon: CornerDownLeft, color: "var(--cyan)", rfType: "return" },
    "util.log": { kind: "util.log", label: "Log / Debug", description: "Print debug info", category: "Utilities", icon: Bug, color: "var(--muted-foreground)", rfType: "default-node" },
};

export const NODE_CATEGORIES: Array<NodeMeta["category"]> = [
    "Triggers", "Data", "Logic", "Integrations", "Utilities",
];

export function nodesByCategory() {
    const map = new Map<NodeMeta["category"], NodeMeta[]>();
    for (const cat of NODE_CATEGORIES) map.set(cat, []);
    for (const meta of Object.values(NODE_META)) {
        map.get(meta.category)!.push(meta);
    }
    return map;
}
