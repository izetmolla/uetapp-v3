import { ReactFlow, Background, Handle, Position, type Node, type Edge, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Webhook, Database, GitBranch, Shuffle, Zap, Globe } from "lucide-react";

type NData = { label: string; sub: string; icon: React.ReactNode; accent: "indigo" | "cyan" | "emerald" | "amber" };

const accent: Record<NData["accent"], { ring: string; bg: string; text: string; dot: string }> = {
  indigo: { ring: "border-indigo-400/40", bg: "bg-indigo-500/10", text: "text-indigo-300", dot: "!bg-indigo-400" },
  cyan: { ring: "border-cyan-400/40", bg: "bg-cyan-500/10", text: "text-cyan-300", dot: "!bg-cyan-400" },
  emerald: { ring: "border-emerald-400/40", bg: "bg-emerald-500/10", text: "text-emerald-300", dot: "!bg-emerald-400" },
  amber: { ring: "border-amber-400/40", bg: "bg-amber-500/10", text: "text-amber-300", dot: "!bg-amber-400" },
};

function FlowNode({ data }: NodeProps) {
  const d = data as unknown as NData;
  const a = accent[d.accent];
  return (
    <div className={`group relative rounded-xl border ${a.ring} bg-[oklch(0.17_0.02_270)] backdrop-blur px-3 py-2.5 min-w-[140px] shadow-[0_4px_20px_-8px_rgba(0,0,0,0.6)]`}>
      <Handle type="target" position={Position.Left} className={`${a.dot} !w-2 !h-2 !border-0`} />
      <div className="flex items-center gap-2">
        <span className={`inline-flex size-7 items-center justify-center rounded-md ${a.bg} ${a.text}`}>{d.icon}</span>
        <div className="leading-tight">
          <div className="text-[12px] font-semibold text-foreground">{d.label}</div>
          <div className="text-[10px] text-muted-foreground">{d.sub}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className={`${a.dot} !w-2 !h-2 !border-0`} />
    </div>
  );
}

const nodeTypes = { ft: FlowNode };

const nodes: Node[] = [
  { id: "1", type: "ft", position: { x: 0, y: 10 }, data: { label: "Webhook", sub: "POST /orders", icon: <Webhook className="size-4" />, accent: "indigo" } },
  { id: "2", type: "ft", position: { x: 0, y: 110 }, data: { label: "Entity", sub: "orders", icon: <Database className="size-4" />, accent: "cyan" } },
  { id: "3", type: "ft", position: { x: 0, y: 210 }, data: { label: "Trigger", sub: "on:create", icon: <Zap className="size-4" />, accent: "amber" } },
  { id: "4", type: "ft", position: { x: 220, y: 60 }, data: { label: "Condition", sub: "amount > 100", icon: <GitBranch className="size-4" />, accent: "indigo" } },
  { id: "5", type: "ft", position: { x: 220, y: 180 }, data: { label: "Transform", sub: "map → invoice", icon: <Shuffle className="size-4" />, accent: "emerald" } },
  { id: "6", type: "ft", position: { x: 440, y: 120 }, data: { label: "Endpoint", sub: "POST /stripe", icon: <Globe className="size-4" />, accent: "cyan" } },
];

const edges: Edge[] = [
  { id: "e1-4", source: "1", target: "4", animated: true, style: { stroke: "url(#ft-grad)", strokeWidth: 1.5 } },
  { id: "e2-4", source: "2", target: "4", animated: true, style: { stroke: "url(#ft-grad)", strokeWidth: 1.5 } },
  { id: "e3-5", source: "3", target: "5", animated: true, style: { stroke: "url(#ft-grad)", strokeWidth: 1.5 } },
  { id: "e4-6", source: "4", target: "6", animated: true, style: { stroke: "url(#ft-grad)", strokeWidth: 1.5 } },
  { id: "e5-6", source: "5", target: "6", animated: true, style: { stroke: "url(#ft-grad)", strokeWidth: 1.5 } },
];

export function FlowCanvas() {
  return (
    <div className="glass-card rounded-2xl p-3 h-80 relative overflow-hidden">
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-emerald-400 animate-glow-pulse" />
        Workflow Engine · live
      </div>
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="ft-grad" x1="0" x2="1">
            <stop offset="0" stopColor="oklch(0.62 0.21 275)" />
            <stop offset="1" stopColor="oklch(0.74 0.15 215)" />
          </linearGradient>
        </defs>
      </svg>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        panOnDrag={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        className="!bg-transparent"
      >
        <Background color="oklch(1 0 0 / 8%)" gap={18} size={1} />
      </ReactFlow>
    </div>
  );
}
