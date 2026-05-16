import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";

/** Renders children at a fixed design width and scales-to-fit the parent on smaller screens. */
function ScaleToFit({ width = 720, children }: { width?: number; children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const measure = () => {
      const w = containerRef.current?.clientWidth ?? width;
      const s = Math.min(1, w / width);
      setScale(s);
      const h = innerRef.current?.scrollHeight ?? 0;
      setHeight(h * s);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    if (innerRef.current) ro.observe(innerRef.current);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [width]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden" style={{ height }}>
      <div
        ref={innerRef}
        style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------------- Shared bits ---------------- */

type Accent = "indigo" | "emerald" | "violet";

const accentMap: Record<Accent, { badge: string; cta: string; glow: string; ring: string }> = {
  indigo: {
    badge: "bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-400/30",
    cta: "text-indigo-300 hover:text-indigo-200",
    glow: "shadow-[0_0_80px_-20px_rgba(99,102,241,0.55)]",
    ring: "ring-1 ring-indigo-500/20",
  },
  emerald: {
    badge: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/30",
    cta: "text-emerald-300 hover:text-emerald-200",
    glow: "shadow-[0_0_80px_-20px_rgba(16,185,129,0.5)]",
    ring: "ring-1 ring-emerald-500/20",
  },
  violet: {
    badge: "bg-violet-500/10 text-violet-300 ring-1 ring-violet-400/30",
    cta: "text-violet-300 hover:text-violet-200",
    glow: "shadow-[0_0_80px_-20px_rgba(139,92,246,0.55)]",
    ring: "ring-1 ring-violet-500/20",
  },
};

function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 rounded-full border border-hairline bg-surface-1 px-3 py-2 text-sm text-foreground/85">
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-surface-2 text-[13px]">
        {icon}
      </span>
      {children}
    </li>
  );
}

function TextSide({
  eyebrow,
  accent,
  headline,
  body,
  pills,
  cta,
  extra,
}: {
  eyebrow: string;
  accent: Accent;
  headline: string;
  body: string;
  pills: { icon: React.ReactNode; text: string }[];
  cta: string;
  extra?: React.ReactNode;
}) {
  const a = accentMap[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: 0.0 }}
    >
      <span className={cn("inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase", a.badge)}>
        {eyebrow}
      </span>
      <h3 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight max-w-md">{headline}</h3>
      <p className="mt-4 text-muted-foreground max-w-md leading-relaxed">{body}</p>
      <ul className="mt-6 space-y-2.5 max-w-md">
        {pills.map((p) => (
          <Pill key={p.text} icon={p.icon}>{p.text}</Pill>
        ))}
      </ul>
      {extra && <div className="mt-5">{extra}</div>}
      <a href="#" className={cn("mt-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors", a.cta)}>
        {cta}
      </a>
    </motion.div>
  );
}

function VisualFrame({ accent, children }: { accent: Accent; children: React.ReactNode }) {
  const a = accentMap[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className={cn("dark rounded-2xl w-full overflow-hidden", a.glow, a.ring)}
    >
      <ScaleToFit width={720}>{children}</ScaleToFit>
    </motion.div>
  );
}

/* ---------------- Row 1: UI Builder Mockup ---------------- */

function UIBuilderMockup() {
  const components = [
    { name: "Button", svg: <RectIcon /> },
    { name: "Card", svg: <SquareIcon /> },
    { name: "Table", svg: <GridIcon /> },
    { name: "Form", svg: <LinesIcon /> },
    { name: "Chart", svg: <ChartIcon /> },
  ];

  return (
    <div className="bg-[#0D0D16] border border-white/10 rounded-xl overflow-hidden">
      {/* Top bar */}
      <div className="h-10 bg-[#0F0F1C] border-b border-white/10 flex items-center justify-between px-3">
        <div className="flex items-center gap-1.5">
          {["▣", "▢", "T"].map((s) => (
            <button key={s} className="size-6 rounded-md bg-white/5 hover:bg-white/10 text-[11px] text-white/70 flex items-center justify-center">{s}</button>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground font-mono">acme-store / homepage</div>
        <div className="flex items-center gap-1.5">
          <button className="h-6 px-2 text-[11px] rounded-md text-white/70 hover:bg-white/5">Preview</button>
          <button className="h-6 px-2 text-[11px] rounded-md bg-indigo-500/90 hover:bg-indigo-500 text-white">Publish</button>
        </div>
      </div>

      <div className="flex h-[420px]">
        {/* Left panel */}
        <div className="w-44 shrink-0 border-r border-white/10 bg-[#0B0B14] p-2.5">
          <div className="text-[9px] font-semibold tracking-[0.18em] text-white/40 uppercase mb-2 px-1">Components</div>
          <div className="space-y-1.5">
            {components.map((c) => (
              <div key={c.name} className="bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white/75 flex items-center gap-2 hover:bg-white/[0.07]">
                <span className="text-white/40">⋮⋮</span>
                <span className="text-white/50 size-3">{c.svg}</span>
                {c.name}
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-[#0A0A12] p-4 overflow-hidden">
          {/* hero */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-lg p-3">
            <div className="h-2.5 w-32 rounded bg-white/20 mb-1.5" />
            <div className="h-1.5 w-48 rounded bg-white/10 mb-3" />
            <div className="inline-block h-6 px-3 rounded-md bg-indigo-500/80 text-[10px] text-white leading-6">Get Started</div>
          </div>

          {/* 3-column grid */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {["bg-indigo-400", "bg-cyan-400", "bg-violet-400"].map((c, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-md overflow-hidden">
                <div className={cn("h-1", c)} />
                <div className="p-2 space-y-1">
                  <div className="h-1.5 w-3/4 bg-white/15 rounded" />
                  <div className="h-1 w-1/2 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Drop zone */}
          <div className="mt-4 border-2 border-dashed border-indigo-400/50 rounded-lg bg-indigo-500/5 h-20 animate-pulse" />

          {/* Floating dragging card */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ rotate: 2 }}
            className="absolute right-6 bottom-10 w-44 bg-[#11111E] border border-indigo-400/50 rounded-lg p-3 shadow-lg shadow-indigo-500/30"
          >
            <div className="text-[9px] uppercase tracking-wider text-indigo-300/80 mb-1">Stats Card</div>
            <div className="text-lg font-semibold text-white">$48,210</div>
            <div className="text-[10px] text-emerald-400">+12.4% vs last week</div>
            <div className="mt-2 flex gap-0.5 items-end h-6">
              {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
                <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-indigo-400/60 rounded-sm" />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right panel */}
        <div className="w-40 shrink-0 border-l border-white/10 bg-[#0B0B14] p-2.5 space-y-3">
          <div className="text-[9px] font-semibold tracking-[0.18em] text-white/40 uppercase px-1">Properties</div>

          <div className="space-y-1">
            <div className="text-[10px] text-white/50">Width</div>
            <input type="range" defaultValue={70} className="w-full h-1 accent-indigo-400" />
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-white/50">Background</div>
            <div className="flex gap-1.5">
              {["bg-indigo-400", "bg-cyan-400", "bg-violet-400", "bg-white/30"].map((c, i) => (
                <div key={i} className={cn("size-4 rounded-full ring-1 ring-white/20", c)} />
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-white/50">Border radius</div>
            <div className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] text-white/70">12 px</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-white/50">Padding</div>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-white/60">
              <div /> <div className="bg-white/5 border border-white/10 rounded text-center py-0.5">16</div> <div />
              <div className="bg-white/5 border border-white/10 rounded text-center py-0.5">16</div>
              <div className="bg-indigo-500/20 border border-indigo-400/30 rounded text-center py-0.5">⊡</div>
              <div className="bg-white/5 border border-white/10 rounded text-center py-0.5">16</div>
              <div /> <div className="bg-white/5 border border-white/10 rounded text-center py-0.5">16</div> <div />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* tiny svg icons for sidebar */
function RectIcon() { return <svg viewBox="0 0 12 12" className="size-3"><rect x="1" y="3" width="10" height="6" rx="1" fill="currentColor" /></svg>; }
function SquareIcon() { return <svg viewBox="0 0 12 12" className="size-3"><rect x="2" y="2" width="8" height="8" rx="1" stroke="currentColor" fill="none" /></svg>; }
function GridIcon() { return <svg viewBox="0 0 12 12" className="size-3"><path d="M1 4h10M1 7h10M4 1v10M8 1v10" stroke="currentColor" /></svg>; }
function LinesIcon() { return <svg viewBox="0 0 12 12" className="size-3"><path d="M2 3h8M2 6h8M2 9h5" stroke="currentColor" /></svg>; }
function ChartIcon() { return <svg viewBox="0 0 12 12" className="size-3"><path d="M2 10V6M5 10V3M8 10V7M11 10V4" stroke="currentColor" /></svg>; }

/* ---------------- Row 2: Workflow Mockup ---------------- */

function WorkflowMockup() {
  // Node positions on a 600x420 canvas
  const W = 600, H = 420;
  type N = { id: string; x: number; y: number; w: number; h: number; label: string; sub: string; color: string; icon: string; external?: "G" | "M" };
  const nodes: N[] = [
    { id: "trigger", x: 220, y: 14, w: 160, h: 50, label: "HTTP Trigger", sub: "POST /api/orders", color: "indigo", icon: "⚡" },
    { id: "cond", x: 220, y: 110, w: 160, h: 50, label: "Check Stock", sub: "entity: inventory", color: "amber", icon: "◇" },
    { id: "alert", x: 20, y: 210, w: 160, h: 50, label: "Send Alert", sub: "Email → admin@acme", color: "rose", icon: "✉" },
    { id: "create", x: 420, y: 210, w: 160, h: 50, label: "Create Order", sub: "entity: orders", color: "emerald", icon: "＋" },
    { id: "sheets", x: 320, y: 300, w: 170, h: 50, label: "Google Sheets", sub: "Append row", color: "cyan", icon: "G", external: "G" },
    { id: "sendgrid", x: 510, y: 300, w: 80, h: 50, label: "Email", sub: "SendGrid", color: "amber", icon: "✉", external: "M" },
    { id: "return", x: 220, y: 360, w: 160, h: 50, label: "Return Response", sub: "200 OK → client", color: "violet", icon: "↩" },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; barL?: string }> = {
    indigo: { bg: "fill-indigo-500/15", border: "stroke-indigo-400/60", text: "fill-indigo-200" },
    amber: { bg: "fill-amber-500/15", border: "stroke-amber-400/60", text: "fill-amber-200" },
    rose: { bg: "fill-rose-500/15", border: "stroke-rose-400/60", text: "fill-rose-200" },
    emerald: { bg: "fill-emerald-500/15", border: "stroke-emerald-400/60", text: "fill-emerald-200" },
    cyan: { bg: "fill-cyan-500/10", border: "stroke-white/15", text: "fill-cyan-200" },
    violet: { bg: "fill-violet-500/15", border: "stroke-violet-400/60", text: "fill-violet-200" },
  };

  function nodeById(id: string) { return nodes.find((n) => n.id === id)!; }
  function curve(fromId: string, toId: string) {
    const a = nodeById(fromId), b = nodeById(toId);
    const x1 = a.x + a.w / 2, y1 = a.y + a.h;
    const x2 = b.x + b.w / 2, y2 = b.y;
    const cy = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`;
  }

  const edges = [
    { from: "trigger", to: "cond", style: "internal" },
    { from: "cond", to: "alert", style: "internal", label: "out of stock", color: "rose" },
    { from: "cond", to: "create", style: "internal", label: "in stock", color: "emerald" },
    { from: "create", to: "sheets", style: "external" },
    { from: "create", to: "sendgrid", style: "external" },
    { from: "sheets", to: "return", style: "internal" },
    { from: "alert", to: "return", style: "internal" },
  ];

  return (
    <div className="bg-[#0D0D16] border border-white/10 rounded-xl overflow-hidden">
      {/* Top bar */}
      <div className="h-10 bg-[#0F0F1C] border-b border-white/10 flex items-center justify-between px-3">
        <div className="text-[11px] text-white/50 font-mono">●●●</div>
        <div className="text-[11px] text-white/80 font-medium">Workflow: <span className="text-white/50">order-fulfillment</span></div>
        <div className="flex items-center gap-1.5">
          <button className="h-6 px-2 text-[11px] rounded-md text-white/70 hover:bg-white/5">Save</button>
          <button className="h-6 px-2.5 text-[11px] rounded-md bg-emerald-500/90 hover:bg-emerald-500 text-white font-medium">▶ Run</button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative h-[440px] overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          backgroundColor: "#0A0A12",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <style>{`
              .flow-dash { stroke-dasharray: 6 4; animation: flow-dash 1s linear infinite; }
              .flow-dot { stroke-dasharray: 2 4; animation: flow-dash 1.6s linear infinite; }
              @keyframes flow-dash { to { stroke-dashoffset: -20; } }
            `}</style>
          </defs>

          {/* Edges */}
          {edges.map((e, i) => {
            const stroke =
              e.color === "rose" ? "#fb7185" :
              e.color === "emerald" ? "#34d399" :
              e.style === "external" ? "#22d3ee" : "#a5b4fc";
            return (
              <g key={i}>
                <path
                  d={curve(e.from, e.to)}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={1.5}
                  className={e.style === "external" ? "flow-dot" : "flow-dash"}
                  opacity={0.85}
                />
                {e.label && (() => {
                  const a = nodeById(e.from), b = nodeById(e.to);
                  const mx = (a.x + a.w / 2 + b.x + b.w / 2) / 2;
                  const my = (a.y + a.h + b.y) / 2;
                  return (
                    <text x={mx} y={my} fontSize="9" fill={stroke} textAnchor="middle" className="font-mono">{e.label}</text>
                  );
                })()}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const c = colorMap[n.color];
            return (
              <g key={n.id}>
                {n.external && (
                  <rect x={n.x} y={n.y} width={3} height={n.h} rx={1.5} className={n.external === "G" ? "fill-cyan-400" : "fill-amber-400"} />
                )}
                <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={8} className={cn(c.bg, c.border)} strokeWidth={1} />
                <text x={n.x + 12} y={n.y + 22} fontSize="11" fontWeight="600" className={c.text}>
                  <tspan className="opacity-70">{n.icon} </tspan>{n.label}
                </text>
                <text x={n.x + 12} y={n.y + 38} fontSize="9" fill="#9ca3af" className="font-mono">{n.sub}</text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 left-3 text-[10px] text-white/40 font-mono flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-indigo-300" /> Internal</span>
          <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-cyan-300/70 ring-1 ring-cyan-300/50" /> External</span>
          <span>→ Data flow</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Row 3: AI Chat Mockup ---------------- */

function AIChatMockup() {
  return (
    <div className="bg-[#0D0D16] border border-white/10 rounded-xl overflow-hidden flex flex-col h-[520px]">
      {/* Top bar */}
      <div className="h-12 bg-[#0F0F1C] border-b border-white/10 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-full bg-violet-500/80 text-white text-[10px] font-bold flex items-center justify-center">AI</div>
          <div>
            <div className="text-[12px] font-semibold text-white leading-none">FlowTrove AI</div>
            <div className="text-[10px] text-white/50 flex items-center gap-1 mt-0.5"><span className="size-1.5 rounded-full bg-emerald-400" /> online</div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-white/40">
          {["⊟", "⚙", "⛶"].map((s) => <button key={s} className="size-6 rounded hover:bg-white/5 text-xs">{s}</button>)}
        </div>
      </div>

      {/* Context bar */}
      <div className="bg-white/[0.02] border-b border-white/5 px-3 py-1.5 flex items-center gap-1.5 text-[10px] shrink-0 overflow-x-auto">
        <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/30 whitespace-nowrap">Context: acme-store</span>
        <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/60 ring-1 ring-white/10 whitespace-nowrap">3 entities loaded</span>
        <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/60 ring-1 ring-white/10 whitespace-nowrap">page: homepage</span>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden p-3 space-y-3">
        {/* Msg 1 - user */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-start gap-2 justify-end"
        >
          <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-indigo-600 text-white text-xs px-3 py-2">
            Create a dashboard page for my orders entity with a KPI header and a filterable data table
          </div>
          <div className="size-7 rounded-full bg-white/10 text-white text-[10px] font-bold flex items-center justify-center shrink-0">JD</div>
        </motion.div>

        {/* Msg 2 - AI */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-start gap-2"
        >
          <div className="size-7 rounded-full bg-violet-500/80 text-white text-[10px] font-bold flex items-center justify-center shrink-0">AI</div>
          <div className="max-w-[80%] border-l-2 border-violet-400/60 pl-3">
            <div className="text-xs text-white/85">I'll create the orders dashboard for you. Here's what I'm building:</div>
            <div className="bg-black/30 border border-white/10 rounded-lg p-2 mt-2 text-[11px] font-mono space-y-0.5 text-white/70">
              <div><span className="text-emerald-400">✓</span> KPI cards: total_orders, revenue, pending</div>
              <div><span className="text-emerald-400">✓</span> Table: orders entity (sortable, filterable)</div>
              <div><span className="text-emerald-400">✓</span> Filters: status, date_range, customer</div>
              <div className="text-violet-300 flex items-center gap-1.5">
                <span className="inline-block animate-spin">⟳</span> Generating layout...
              </div>
            </div>
          </div>
        </motion.div>

        {/* Msg 3 - AI preview card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-start gap-2"
        >
          <div className="size-7 shrink-0" />
          <div className="max-w-[85%] bg-[#0F0F1C] border border-white/10 rounded-lg p-3 w-full">
            <div className="grid grid-cols-3 gap-1.5">
              {[["Orders", "1,284"], ["Revenue", "$48.2k"], ["Pending", "37"]].map(([k, v]) => (
                <div key={k} className="bg-white/5 rounded p-1.5">
                  <div className="text-[8px] text-white/50 uppercase tracking-wider">{k}</div>
                  <div className="text-[11px] font-semibold text-white">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 space-y-1">
              {[
                ["#1042", "Acme Co.", "fulfilled", "bg-emerald-500/20 text-emerald-300"],
                ["#1041", "Globex", "pending", "bg-amber-500/20 text-amber-300"],
                ["#1040", "Initech", "returned", "bg-rose-500/20 text-rose-300"],
              ].map(([id, c, s, cls]) => (
                <div key={id} className="flex items-center justify-between text-[10px] text-white/70 bg-white/[0.02] rounded px-1.5 py-1">
                  <span className="font-mono">{id}</span>
                  <span>{c}</span>
                  <span className={cn("px-1.5 py-0.5 rounded text-[9px]", cls)}>{s}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-1.5">
              <button className="h-6 px-2 text-[10px] rounded bg-indigo-500/90 text-white">Add to page</button>
              <button className="h-6 px-2 text-[10px] rounded text-white/70 hover:bg-white/5">Modify</button>
            </div>
          </div>
        </motion.div>

        {/* Msg 4 - user */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex items-start gap-2 justify-end"
        >
          <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-indigo-600 text-white text-xs px-3 py-2">
            Make the table show only today's orders by default and add an export to CSV button
          </div>
          <div className="size-7 rounded-full bg-white/10 text-white text-[10px] font-bold flex items-center justify-center shrink-0">JD</div>
        </motion.div>
      </div>

      {/* Input */}
      <div className="bg-[#0F0F1C] border-t border-white/10 p-3 shrink-0">
        <div className="flex items-center gap-2">
          <button className="h-8 px-2 rounded-md bg-white/5 border border-white/10 text-xs text-white/60 font-mono">/</button>
          <div className="flex-1 bg-white/5 border border-violet-400/30 ring-2 ring-violet-500/20 rounded-xl px-3 py-2 text-xs text-white/50">
            Ask AI or type / for commands...
          </div>
          <button className="size-8 rounded-md hover:bg-white/5 text-white/60 text-sm">📎</button>
          <button className="size-8 rounded-md bg-violet-500/90 hover:bg-violet-500 text-white text-sm">↑</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["Design a page", "Add entity field", "Write an email", "Deploy changes"].map((q) => (
            <button key={q} className="px-2 py-0.5 text-[10px] rounded-full border border-white/10 text-white/60 hover:bg-white/5">{q}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Section ---------------- */

const rows: {
  accent: Accent;
  eyebrow: string;
  headline: string;
  body: string;
  pills: { icon: React.ReactNode; text: string }[];
  cta: string;
  visual: React.ReactNode;
  reverse: boolean;
  extra?: React.ReactNode;
}[] = [
  {
    accent: "indigo",
    eyebrow: "UI Builder",
    headline: "Design like a pro. Ship like an engineer.",
    body: "Drop in Shadcn components, wire them to live data, and compose stunning layouts — all with drag and drop. No JSX, no CSS wrestling.",
    pills: [
      { icon: "⬡", text: "Shadcn + Tailwind component library" },
      { icon: "↔", text: "Drag, resize & nest freely" },
      { icon: "⚡", text: "Live preview on every change" },
    ],
    cta: "Explore the UI Builder →",
    visual: <UIBuilderMockup />,
    reverse: false,
  },
  {
    accent: "emerald",
    eyebrow: "Workflow Engine",
    headline: "Your backend, without the backend.",
    body: "Build multi-step backend logic visually. Connect triggers, conditions, transformations, and actions — integrating your entities with external services without writing a single line of code.",
    pills: [
      { icon: "🔁", text: "Visual node-based workflow builder" },
      { icon: "🔌", text: "Connect to entities, endpoints & APIs" },
      { icon: "📬", text: "Built-in: Email, Google, AWS, Webhooks" },
    ],
    cta: "Explore Workflows →",
    visual: <WorkflowMockup />,
    reverse: true,
  },
  {
    accent: "violet",
    eyebrow: "AI Assistant",
    headline: "Your AI co-builder is already here.",
    body: "From writing copy to engineering entire app features, FlowTrove's AI works inside your workspace context. It knows your entities, your schema, your layout — and builds with you, not just for you.",
    pills: [
      { icon: "🧠", text: "Context-aware of your full workspace" },
      { icon: "🎨", text: "Designs, codes & deploys on command" },
      { icon: "🔌", text: "Works via MCP with Claude, GPT, Cursor" },
    ],
    cta: "Try the AI Assistant →",
    visual: <AIChatMockup />,
    reverse: false,
    extra: (
      <div className="flex gap-2">
        <span className="px-2.5 py-1 text-xs font-mono rounded-full bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/30">/design</span>
        <span className="px-2.5 py-1 text-xs font-mono rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">/entity</span>
        <span className="px-2.5 py-1 text-xs font-mono rounded-full bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/30">/deploy</span>
      </div>
    ),
  },
];

export function Spotlights() {
  return (
    <section className="py-24 sm:py-32 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24 sm:space-y-32">
        {rows.map((r, i) => (
          <div
            key={i}
            className={cn(
              "grid lg:grid-cols-2 gap-10 lg:gap-16 items-center",
              r.reverse && "lg:[&>*:first-child]:order-2"
            )}
          >
            <TextSide
              eyebrow={r.eyebrow}
              accent={r.accent}
              headline={r.headline}
              body={r.body}
              pills={r.pills}
              cta={r.cta}
              extra={r.extra}
            />
            <VisualFrame accent={r.accent}>{r.visual}</VisualFrame>
          </div>
        ))}
      </div>
    </section>
  );
}
